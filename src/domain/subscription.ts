export const subscriptionPlans = [
  {code:'monthly',productId:'com.whichdrake.app.fullaccess.monthly',title:'Monthly',price:'$1.99/month',allowance:'50 recommendations per month'},
  {code:'annual',productId:'com.whichdrake.app.fullaccess.annual',title:'Annual',price:'$9.99/year',allowance:'300 recommendations per year',value:'Better value'},
] as const;
export type SubscriptionProductId=(typeof subscriptionPlans)[number]['productId'];
