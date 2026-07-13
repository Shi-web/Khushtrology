import stripe
from fastapi import APIRouter, HTTPException, Request, Header
from app.models.schemas import CheckoutSessionRequest, CheckoutSessionResponse
from app.config import settings

router = APIRouter(prefix="/checkout", tags=["payments"])
stripe.api_key = settings.stripe_secret_key


@router.post("/session", response_model=CheckoutSessionResponse)
async def create_checkout_session(req: CheckoutSessionRequest):
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": "Khushtrology Cosmic Reading"},
                        "unit_amount": round(req.amount * 100),
                    },
                    "quantity": 1,
                }
            ],
            success_url=req.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=req.cancel_url,
        )
        return CheckoutSessionResponse(session_id=session.id, url=session.url)
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
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
        # TODO: fulfil order — send email, unlock content, etc.
        print(f"[webhook] Payment complete for session {session['id']}")

    return {"received": True}
