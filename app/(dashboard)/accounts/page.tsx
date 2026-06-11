import { createClient } from '@/lib/supabase/server'
import AccountsClient from '@/components/accounts/AccountsClient'

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: accounts } = await supabase
    .from('accounts').select('*').eq('user_id', user!.id).order('created_at')
  return <AccountsClient initialAccounts={accounts ?? []} />
}