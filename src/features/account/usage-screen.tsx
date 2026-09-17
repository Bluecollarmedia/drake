import { useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { DetailHeading } from '@/components/detail-heading';
import { Button } from '@/components/button';
import { InlineError } from '@/components/inline-error';
import { loadInstallationId, loadUsageStatus } from '@/data/usage';
import type { UsageStatus } from '@/domain/usage';
import { useAuth } from '@/state/auth-state';
import { colors } from '@/design/tokens';
export function UsageScreen() {
  const auth=useAuth(); const [status,setStatus]=useState<UsageStatus|null>(null);const [installationId,setInstallationId]=useState<string|null>(null);const [error,setError]=useState(false);const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    if(!auth.ready)return;
    let active=true;
    Promise.all([loadUsageStatus(),loadInstallationId()]).then(([value,id])=>{if(active){setStatus(value);setInstallationId(id);setError(false);}}).catch(()=>{if(active)setError(true);});
    return()=>{active=false;};
  },[auth.ready,attempt]);
  const title=status?.testAccess?'Development access':status?.plan==='monthly'?'Monthly Full Access':status?.plan==='annual'?'Annual Full Access':'Free';
  const reset=status?.resetAt?new Date(status.resetAt).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'}):null;
  return <Screen><DetailHeading title="Usage" /><Text accessibilityRole="header" style={styles.heading}>{title}</Text>
    <Text style={styles.copy}>{status?.testAccess?'Development test access is active on this installation.':status?.enabled ? 'Your recommendation allowance is enforced securely by Which Drake?.' : 'Recommendations are taking a pause right now.'}</Text>
    {status&&!status.testAccess?<View style={styles.summary}><Text style={styles.number}>{status.remaining??0}</Text><Text style={styles.label}>recommendations remaining</Text>
      <Text style={styles.detail}>{status.used} of {status.allowance??0} used{reset?` · resets ${reset}`:''}</Text></View>:null}
    {status?.plan==='free'?<Button label="View Full Access" onPress={()=>router.push('/subscription' as Href)}/>:null}
    {__DEV__&&installationId?<Text selectable style={styles.identifier}>Test installation ID{`\n`}{installationId}</Text>:null}
    <InlineError message={error || auth.error ? 'Your usage status couldn’t be loaded.' : null}/>
    {(error || auth.error) && <Button label="Try Again" variant="outline" onPress={()=>{auth.retry();setAttempt(value=>value+1);}}/>}
  </Screen>;
}
const styles=StyleSheet.create({heading:{color:colors.ink,fontSize:26,lineHeight:34,fontWeight:'600',letterSpacing:-0.5,marginBottom:20},copy:{color:colors.secondary,fontSize:17,lineHeight:26,marginBottom:24},
 summary:{backgroundColor:colors.surface,borderRadius:20,padding:22,alignItems:'center',gap:6,marginBottom:20},number:{color:colors.ink,fontSize:42,fontWeight:'700'},label:{color:colors.ink,fontSize:17,fontWeight:'600'},
 detail:{color:colors.secondary,fontSize:14,textAlign:'center'},identifier:{color:colors.secondary,fontSize:12,lineHeight:18,marginTop:24}});
