/**
 * AI Autopilot — Stripe Billing Configuration
 *
 * This file defines the product structure for Stripe integration.
 * In production, the publishable key would come from env vars.
 *
 * Credit system:
 *   1 credit = 1 AI image gen, 1 shortcut discovery, or 1 training session
 *   Hard cap: users cannot exceed plan credits without purchasing more
 *   Lifetime BYOK: users connect their own API keys to bypass credit system
 */

const STRIPE_CONFIG = {
    // Replace with your actual Stripe publishable key
    publishableKey: 'pk_test_REPLACE_WITH_YOUR_STRIPE_KEY',

    products: {
        starter: {
            name: 'Starter',
            priceId: null, // Free tier, no Stripe product
            credits: 50,
            price: 0,
            interval: null,
            features: [
                'Context-aware shortcuts',
                '15 buttons active',
                'Basic training games',
                'Right or left hand layout',
            ],
        },
        pro: {
            name: 'Pro',
            priceId: 'price_REPLACE_PRO_MONTHLY', // Stripe price ID
            credits: 500,
            price: 900, // $9.00 in cents
            interval: 'month',
            features: [
                'All 32 buttons',
                'AI-generated icons',
                'Community knowledge base',
                'Custom macros & URL triggers',
                'All training modes + analytics',
            ],
        },
        lifetime: {
            name: 'Lifetime',
            priceId: 'price_REPLACE_LIFETIME', // Stripe price ID (one-time)
            credits: 200, // per month, included
            price: 14900, // $149.00 in cents
            interval: null, // one-time payment
            byok: true, // Bring Your Own Key enabled
            features: [
                'Everything in Pro',
                'Pay once, own forever',
                'All future updates',
                'Bring Your Own API Key',
                'OpenRouter / OpenAI / Replicate',
                'Unlimited with your own key',
            ],
        },
    },

    creditPacks: [
        { credits: 100, price: 500, label: '$5 for 100 credits' },
        { credits: 500, price: 2000, label: '$20 for 500 credits' },
    ],

    // Usage meters for Stripe Billing
    meters: {
        imageGeneration: 'meter_ai_image_gen',
        shortcutDiscovery: 'meter_shortcut_discovery',
        trainingSession: 'meter_training_session',
    },
};

/**
 * Initialize Stripe checkout for a plan
 * In production, this would call your backend to create a Checkout Session
 */
async function initCheckout(planKey) {
    const plan = STRIPE_CONFIG.products[planKey];
    if (!plan || !plan.priceId) {
        console.log('Free tier — no checkout needed');
        return;
    }

    // Placeholder — in production:
    // 1. Call your backend: POST /api/create-checkout-session
    // 2. Backend creates Stripe Checkout Session with the priceId
    // 3. Redirect to Stripe Checkout
    console.log(`Would create Stripe checkout for: ${plan.name} at $${plan.price / 100}`);
    alert(`Stripe checkout coming soon! Plan: ${plan.name} — $${plan.price / 100}${plan.interval ? '/' + plan.interval : ' one-time'}`);
}

/**
 * Purchase credit top-up pack
 */
async function purchaseCredits(packIndex) {
    const pack = STRIPE_CONFIG.creditPacks[packIndex];
    if (!pack) return;

    console.log(`Would purchase credit pack: ${pack.label}`);
    alert(`Credit purchase coming soon! ${pack.label}`);
}

// Wire up pricing buttons
document.getElementById('btn-starter')?.addEventListener('click', (e) => { e.preventDefault(); initCheckout('starter'); });
document.getElementById('btn-pro')?.addEventListener('click', (e) => { e.preventDefault(); initCheckout('pro'); });
document.getElementById('btn-lifetime')?.addEventListener('click', (e) => { e.preventDefault(); initCheckout('lifetime'); });

// Export for module use
if (typeof module !== 'undefined') {
    module.exports = STRIPE_CONFIG;
}
