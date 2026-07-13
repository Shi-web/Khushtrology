import stripe
from fastapi import APIRouter, HTTPException, Request, Header
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.schemas import (
    DonationCheckoutRequest,
    DonationCheckoutResponse,
    DonationsTotalResponse,
)
from app.config import settings
from app.services import donations_db

router = APIRouter(tags=["donations"])
limiter = Limiter(key_func=get_remote_address)
stripe.api_key = settings.stripe_secret_key


@router.post("/donate/create-checkout-session", response_model=DonationCheckoutResponse)
@limiter.limit("10/minute")
async def create_donation_checkout_session(request: Request, req: DonationCheckoutRequest):
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": "Khushtrology Donation"},
                        "unit_amount": req.amount,
                    },
                    "quantity": 1,
                }
            ],
            metadata={"donor_name": req.donor_name},
            success_url=f"{settings.frontend_url}/success",
            cancel_url=f"{settings.frontend_url}/donate",
        )
        return DonationCheckoutResponse(url=session.url)
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/donate/webhook")
async def donation_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.stripe_webhook_secret
        )
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        donor_name = (session.get("metadata") or {}).get("donor_name", "Anonymous")
        amount = session.get("amount_total") or 0
        if amount > 0:
            donations_db.log_donation(donor_name, amount, stripe_session_id=session.get("id"))

    return {"received": True}


@router.get("/donations/total", response_model=DonationsTotalResponse)
async def get_donations_total():
    return DonationsTotalResponse(total=donations_db.get_total())
