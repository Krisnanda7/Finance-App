import { createClient } from '@/lib/supabase/server'
import TransactionListClient from '@/components/transactions/TransactionListClient'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: transactions }, { data: accounts }, { data: categories }] =
    await Promise.all([
      supabase.from('transactions')
        .select('*, account(*), category(*)')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(50),
      supabase.from('accounts').select('*').eq('user_id', user!.id).eq('is_active', true),
      supabase.from('categories').select('*').or(`user_id.eq.${user!.id},is_default.eq.true`),
    ])

  return (
    <TransactionListClient
      initialTransactions={transactions ?? []}
      accounts={accounts ?? []}
      categories={categories ?? []}
    />
  )
}