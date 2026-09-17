import { router } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { colors } from '@/design/tokens';
import { subscriptionPlans } from '@/domain/subscription';
import { loadSubscriptionProducts, nativePurchasesConfigured, purchaseSubscription, restoreSubscriptions } from '@/data/subscriptions';
import { useAuth } from '@/state/auth-state';

export default function SubscriptionScreen(){
 const auth=useAuth(),configured=nativePurchasesConfigured();const [prices,setPrices]=useState<Record<string,string>>({});const [working,setWorking]=useState<string|null>(null);const [message,setMessage]=useState<string|null>(null);
 useEffect(()=>{if(!configured)return;let active=true;loadSubscriptionProducts().then(products=>{if(active)setPrices(Object.fromEntries(products.map(product=>[product.productId,product.displayPrice])));}).catch(()=>{if(active)setMessage('Subscriptions aren’t available right now. Please try again later.');});return()=>{active=false;};},[configured]);
 const buy=async(productId:(typeof subscriptionPlans)[number]['productId'])=>{if(!auth.hasAccount){router.push('/account' as never);return;}setWorking(productId);setMessage(null);try{await purchaseSubscription(productId);setMessage('Full Access is ready.');}catch(problem){const code=String((problem as Error)?.message||'');if(code!=='purchase_cancelled')setMessage(code==='purchase_timeout'?'The App Store took too long to respond. Please try again.':'We couldn’t complete that purchase. You were not granted access.');}finally{setWorking(null);}};
 const restore=async()=>{if(!auth.hasAccount){router.push('/account' as never);return;}setWorking('restore');setMessage(null);try{const count=await restoreSubscriptions();setMessage(count?'Your Full Access subscription was restored.':'We couldn’t find an active Full Access subscription.');}catch{setMessage('We couldn’t restore purchases right now. Please try again.');}finally{setWorking(null);}};
 const setupLabel=Constants.executionEnvironment===ExecutionEnvironment.StoreClient?'Requires an iOS development build':'Purchases unavailable during setup';
 return <SafeAreaView style={styles.root}><Screen><View style={styles.header}><BrandLogo width={98}/><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={()=>router.back()} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
  <Text accessibilityRole="header" style={styles.heading}>Full Access</Text>
  <Text style={styles.copy}>Keep finding the Drake song that fits. Every plan includes the same recommendation quality.</Text>
  <View style={styles.plans}>{subscriptionPlans.map(plan=><View key={plan.code} style={[styles.plan,plan.code==='annual'&&styles.featured]}>
    <View style={styles.planHeader}><Text style={styles.planTitle}>{plan.title}</Text>{'value' in plan?<Text style={styles.value}>{plan.value}</Text>:null}</View>
    <Text style={styles.price}>{prices[plan.productId]??plan.price}</Text><Text style={styles.allowance}>{plan.allowance}</Text>
    <Button label={!auth.hasAccount?'Create account to subscribe':configured?working===plan.productId?'Opening App Store…':`Choose ${plan.title}`:setupLabel} disabled={working!==null||(!configured&&auth.hasAccount)} onPress={()=>{void buy(plan.productId);}} style={{marginTop:16}}/>
  </View>)}</View>
  {message?<Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>:null}
  <Text style={styles.note}>Subscriptions renew automatically unless canceled. Your App Store confirmation shows the final localized price and billing terms.</Text>
  <View style={styles.links}><Pressable onPress={()=>router.push('/settings/terms' as never)}><Text style={styles.link}>Terms</Text></Pressable><Text style={styles.dot}>·</Text><Pressable onPress={()=>router.push('/settings/privacy' as never)}><Text style={styles.link}>Privacy Policy</Text></Pressable></View>
  {Platform.OS==='ios'?<View style={styles.actions}><Button label={working==='restore'?'Restoring…':'Restore Purchases'} variant="outline" disabled={!configured||working!==null} onPress={()=>{void restore();}}/><Button label="Manage Apple Subscriptions" variant="outline" onPress={()=>{void Linking.openURL('https://apps.apple.com/account/subscriptions');}}/></View>:null}
 </Screen></SafeAreaView>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.white},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28},close:{width:44,height:44,alignItems:'flex-end',justifyContent:'center'},closeText:{fontSize:30,color:colors.secondary},
 heading:{color:colors.ink,fontSize:34,lineHeight:40,fontWeight:'700',letterSpacing:-1,textAlign:'center'},copy:{color:colors.secondary,fontSize:17,lineHeight:25,textAlign:'center',marginTop:14,marginBottom:28},
 plans:{gap:14},plan:{borderWidth:1,borderColor:colors.border,borderRadius:20,padding:20},featured:{borderColor:colors.blue,borderWidth:2},planHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},planTitle:{color:colors.ink,fontSize:21,fontWeight:'700'},value:{color:colors.blue,fontSize:13,fontWeight:'700'},price:{color:colors.ink,fontSize:26,fontWeight:'700',marginTop:18},allowance:{color:colors.secondary,fontSize:16,marginTop:6},note:{color:colors.secondary,fontSize:13,lineHeight:19,textAlign:'center',marginVertical:22},
 message:{color:colors.ink,fontSize:14,lineHeight:20,textAlign:'center',marginTop:18},actions:{gap:10},links:{flexDirection:'row',justifyContent:'center',gap:12,marginBottom:14},link:{color:colors.blue,fontSize:14,fontWeight:'600'},dot:{color:colors.secondary}});
