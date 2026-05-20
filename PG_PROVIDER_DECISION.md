# PG Provider Decision

## Decision

Use **PortOne-first integration** for the first production payment implementation.

Toss Payments remains a strong fallback or direct PG option, but the current Pick & Pill requirement is broader than card payment alone:

- PG/card payment
- Naver Pay
- Kakao Pay
- Generic simple payment
- Future simple payment methods such as Toss Pay, PAYCO, Samsung Pay, Apple Pay

PortOne is a better first integration layer for this phase because it is designed to route multiple PG/payment channels through one integration surface.

## Why PortOne First

### 1. Multi-method coverage

PortOne documentation lists payment methods/channels for Naver Pay and Kakao Pay, including `PORTONE_KCP_NAVERPAY` and `PORTONE_KAKAOPAY` style payment channels.

This matches the product requirement better than choosing a single PG first and adding direct Naver Pay/Kakao Pay integrations later.

### 2. Lower integration churn

The app can keep one backend shape:

```text
create-checkout-session
payment-webhook
payments
payment_events
refunds
orders
```

If the underlying PG channel changes, the business tables and admin reports can remain stable.

### 3. Better fit for settlement reports

The current database model already separates:

- customer-facing payment method: `orders.payment_method`
- backend provider: `payments.provider`
- PG transaction identifiers: `payments.pg_payment_id`, `payments.pg_transaction_id`
- raw audit payload: `payment_events.payload`

That maps cleanly to a payment orchestration provider.

## Recommended Payment Method Mapping

| UI method | `orders.payment_method` | PortOne/PG channel note |
| --- | --- | --- |
| 일반 신용카드 | `card` | Primary card PG channel |
| 네이버페이 | `naver_pay` | PortOne Naver Pay-supported channel |
| 카카오페이 | `kakao_pay` | PortOne Kakao Pay-supported channel |
| 간편결제 | `simple_pay` | Route to selected simple-pay channel |
| 토스페이 | `toss_pay` | Optional simple payment method |
| 페이코 | `payco` | Optional simple payment method |
| 삼성페이 | `samsung_pay` | Optional simple payment method |
| 애플페이 | `apple_pay` | Optional simple payment method |

## Required Setup From User

Before coding live payment calls, collect these from the PortOne console:

- Store ID
- Channel key for test payment
- Channel key for production payment
- API secret or webhook secret
- Enabled payment methods/channels
- Webhook URL registration target

Do not put secrets in Vite/Cloudflare public variables.

## Required Environment Variables

Supabase Edge Function secrets:

```text
PORTONE_STORE_ID=
PORTONE_API_SECRET=
PORTONE_WEBHOOK_SECRET=
PORTONE_CARD_CHANNEL_KEY=
PORTONE_NAVER_PAY_CHANNEL_KEY=
PORTONE_KAKAO_PAY_CHANNEL_KEY=
PORTONE_SIMPLE_PAY_CHANNEL_KEY=
APP_BASE_URL=https://mobilelandingpagedesign.pages.dev
```

Frontend public environment variables should not include PortOne secrets.

## Backend Implementation Plan

### 1. `create-checkout-session`

Supabase Edge Function.

Responsibilities:

- Validate authenticated customer if the order has `landing_customer_id`.
- Validate order status is `checkout_started`.
- Create `payments` row with `pending`.
- Update `orders.status` to `pending_payment`.
- Call PortOne payment/session API or return PortOne SDK request parameters.
- Return safe client payload only.

### 2. `payment-webhook`

Supabase Edge Function.

Responsibilities:

- Verify PortOne webhook signature.
- Insert raw payload into `payment_events`.
- Enforce idempotency.
- Update `payments.status`.
- Update `orders.status`, `paid_at`, `cancelled_at`, or `refunded_at`.
- Queue Alimtalk notification later.

### 3. Admin Report Update

After webhook integration:

- `paid_sales_amount` starts filling.
- `payable_commission` becomes actual settlement estimate.
- `estimated_checkout_commission` remains funnel-only.

## Open Items

- Confirm whether Naver Pay/Kakao Pay will be enabled through one PG channel or separate dedicated channels.
- Confirm health supplement seller approval requirements with the selected PG/PortOne channel.
- Confirm refund window and settlement timing.
- Confirm whether commission is based on VAT-inclusive amount, VAT-exclusive amount, or supply amount.

## References

- PortOne payment methods documentation: https://dev-docs.portone.cloud/docs/payment_channels/pmt_methods/
- PortOne payment request documentation: https://portone.gitbook.io/docs/v2-payment/v2-sdk/payment-request
