export const NAV_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      { id: 'intro',      label: 'Introduction' },
      { id: 'quickstart', label: 'Quick Start' },
      { id: 'config',     label: 'Configuration' },
    ],
  },
  {
    title: 'Core Payments',
    items: [
      { id: 'transactions', label: 'Transactions' },
      { id: 'customers',    label: 'Customers' },
      { id: 'refunds',      label: 'Refunds' },
    ],
  },
  {
    title: 'DRF Integration',
    items: [
      { id: 'drf',         label: 'DRF Setup' },
      { id: 'serializers', label: 'Serializers' },
      { id: 'viewsets',    label: 'ViewSets' },
    ],
  },
  {
    title: 'Recurring Billing',
    items: [
      { id: 'subscriptions', label: 'Subscriptions' },
      { id: 'plans',         label: 'Plans' },
    ],
  },
  {
    title: 'Real-time & Events',
    items: [
      { id: 'webhooks',   label: 'Webhooks' },
      { id: 'websockets', label: 'WebSockets' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { id: 'splits',  label: 'Split Payments' },
      { id: 'testing', label: 'Testing' },
      { id: 'errors',  label: 'Error Handling' },
    ],
  },
]

export const LANDING_TOPICS = [
  { num:'01', id:'intro',         name:'Introduction',    desc:'How Paystack works, API concepts, auth flow',           badge:'core' },
  { num:'02', id:'quickstart',    name:'Quick Start',     desc:'Installation, environment setup, first payment',        badge:'core' },
  { num:'03', id:'transactions',  name:'Transactions',    desc:'Initialize, verify, list, charge authorizations',       badge:'core' },
  { num:'04', id:'drf',           name:'DRF Setup',       desc:'Serializers, ViewSets, router config, permissions',     badge:'core' },
  { num:'05', id:'customers',     name:'Customers',       desc:'Create, fetch, update customers & authorization codes', badge:'core' },
  { num:'06', id:'subscriptions', name:'Subscriptions',   desc:'Plans, subscribe, manage renewals, cancel',             badge:'adv'  },
  { num:'07', id:'webhooks',      name:'Webhooks',        desc:'HMAC verification, event handlers, idempotency',        badge:'adv'  },
  { num:'08', id:'websockets',    name:'WebSockets',      desc:'Django Channels, real-time payment updates',            badge:'new'  },
  { num:'09', id:'refunds',       name:'Refunds',         desc:'Full & partial refunds, dispute handling',              badge:'adv'  },
  { num:'10', id:'splits',        name:'Split Payments',  desc:'Multi-party splits, subaccounts, marketplace',          badge:'adv'  },
  { num:'11', id:'testing',       name:'Testing',         desc:'pytest, mocking, test cards, CI setup',                 badge:'core' },
  { num:'12', id:'errors',        name:'Error Handling',  desc:'Exception classes, retry logic, logging',               badge:'core' },
]
