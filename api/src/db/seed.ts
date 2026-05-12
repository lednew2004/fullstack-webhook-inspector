import { faker } from '@faker-js/faker'
import { db } from './index.js'
import { webhooks } from './schema/webhooks.js'

// Eventos comuns do Stripe
const stripeEvents = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'payment_intent.amount_capturable_updated',
  'charge.succeeded',
  'charge.failed',
  'charge.captured',
  'charge.refunded',
  'charge.dispute.created',
  'charge.dispute.updated',
  'invoice.created',
  'invoice.finalized',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.marked_uncollectible',
  'invoice.sent',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'payment_method.attached',
  'payment_method.detached',
  'card.created',
  'card.deleted',
  'refund.created',
  'refund.updated',
  'payout.created',
  'payout.paid',
  'payout.failed',
]

interface StripeWebhookPayload {
  id: string
  object: string
  api_version: string
  created: number
  data: Record<string, unknown>
  livemode: boolean
  pending_webhooks: number
  request: Record<string, unknown>
  type: string
}

function generateStripePayload(eventType: string): StripeWebhookPayload {
  const basePayload: StripeWebhookPayload = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2024-04-10',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `pi_${faker.string.alphanumeric(24)}`,
        object: 'payment_intent',
        amount: faker.number.int({ min: 100, max: 100000 }),
        amount_capturable: 0,
        amount_details: { tip: 0 },
        amount_received: faker.number.int({ min: 0, max: 100000 }),
        application: null,
        application_fee_amount: null,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: 'automatic',
        charges: {
          object: 'list',
          data: [
            {
              id: `ch_${faker.string.alphanumeric(24)}`,
              object: 'charge',
              amount: faker.number.int({ min: 100, max: 100000 }),
            },
          ],
        },
        client_secret: `pi_${faker.string.alphanumeric(24)}_secret_${faker.string.alphanumeric(32)}`,
        confirmation_method: 'automatic',
        created: Math.floor(Date.now() / 1000),
        currency: 'usd',
        customer: `cus_${faker.string.alphanumeric(14)}`,
        description: faker.commerce.productDescription(),
        email: faker.internet.email(),
        status: 'succeeded',
      },
      previous_attributes: {},
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: null,
      idempotency_key: `${faker.string.uuid()}`,
    },
    type: eventType,
  }

  return basePayload
}

function generateUserAgent(): string {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Stripe Webhook Service',
    'curl/7.88.1',
  ]
  return faker.helpers.arrayElement(agents)
}

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  try {
    // Limpar registros existentes
    await db.delete(webhooks)

    const webhooksToInsert = []

    // Gerar 60+ webhooks variados
    for (let i = 0; i < 70; i++) {
      const eventType = faker.helpers.arrayElement(stripeEvents)
      const statusCode = faker.helpers.weightedArrayElement([
        { weight: 85, value: 200 },
        { weight: 10, value: 400 },
        { weight: 3, value: 500 },
        { weight: 2, value: 503 },
      ])

      const payload = generateStripePayload(eventType)
      const bodyString = JSON.stringify(payload, null, 2)

      webhooksToInsert.push({
        method: 'POST',
        pathname: '/webhooks/stripe',
        ip: faker.internet.ipv4(),
        statusCode,
        contentType: 'application/json',
        contentLength: Buffer.byteLength(bodyString),
        queryParams: null,
        headers: {
          'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.alphanumeric(88)}`,
          'user-agent': generateUserAgent(),
          'content-type': 'application/json',
          'accept-encoding': 'gzip',
          'stripe-webhook-id': `we_${faker.string.alphanumeric(20)}`,
          'stripe-webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
        },
        body: bodyString,
      })
    }

    // Inserir em lotes (para evitar sobrecarga)
    const batchSize = 10
    for (let i = 0; i < webhooksToInsert.length; i += batchSize) {
      const batch = webhooksToInsert.slice(i, i + batchSize)
      await db.insert(webhooks).values(batch)
      console.log(
        `✅ Inseridos ${Math.min(i + batchSize, webhooksToInsert.length)}/${webhooksToInsert.length} webhooks`,
      )
    }

    console.log('\n✨ Seed concluído com sucesso!')
    console.log(`📊 Total de webhooks criados: ${webhooksToInsert.length}`)
    console.log('📈 Eventos do Stripe simulados:')

    // Contar eventos por tipo
    const eventCounts = new Map<string, number>()
    webhooksToInsert.forEach((wh) => {
      const payload = JSON.parse(wh.body) as StripeWebhookPayload
      const type = payload.type
      eventCounts.set(type, (eventCounts.get(type) ?? 0) + 1)
    })

    eventCounts.forEach((count, eventType) => {
      console.log(`   - ${eventType}: ${count}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    process.exit(1)
  }
}

seed()
