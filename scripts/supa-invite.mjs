#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url  = process.env.EXPO_PUBLIC_SUPABASE_URL  || process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !anon) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL/ANON or NEXT_PUBLIC vars')

const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD
if (!email || !password) throw new Error('Missing TEST_EMAIL/TEST_PASSWORD')

const supabase = createClient(url, anon)

async function login() {
  const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
  if (signErr) throw signErr
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) throw new Error('No user after sign-in')
  console.log('Signed in as', user.id)
  return user.id
}

const [,, cmd, ...args] = process.argv
const uid = await login()

async function main() {
  if (!cmd || cmd === 'whoami') return

  if (cmd === 'invite') {
    const [agencyId, inviteeEmail] = args
    const { data, error } = await supabase.rpc('invite_agency_member', {
      p_agency_id: agencyId,
      p_invited_email: inviteeEmail
    })
    console.log('invite_agency_member =>', { data, error })
    return
  }

  if (cmd === 'list') {
    const { data, error } = await supabase
      .from('agency_invites')
      .select('id, agency_id, invited_user_id, invited_by, status, created_at')
      .eq('invited_user_id', uid)
      .order('created_at', { ascending: false })
    console.log('pending invites =>', { rows: data?.length ?? 0, data, error })
    return
  }

  if (cmd === 'accept') {
    const [inviteId] = args
    const { data, error } = await supabase.rpc('accept_agency_invite', { p_invite_id: inviteId })
    console.log('accept_agency_invite =>', { data, error })
    return
  }

  if (cmd === 'my-agencies') {
    const { data: owned, error: e1 } = await supabase
      .from('agencies')
      .select('id,name,created_at')
      .eq('owner_id', uid)
      .order('created_at', { ascending: false })

    const { data: memberOf, error: e2 } = await supabase
      .from('agency_members')
      .select('role, agencies!inner(id,name,created_at)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    console.log('owned =>', owned?.length ?? 0, e1 || null)
    owned?.forEach(a => console.log(`OWNER  ${a.id}\t${a.name}\t${a.created_at}`))

    console.log('memberOf =>', memberOf?.length ?? 0, e2 || null)
    memberOf?.forEach(m => console.log(`MEMBER ${m.agencies.id}\t${m.agencies.name}\t${m.role}\t${m.agencies.created_at}`))
    return
  }

  if (cmd === 'members') {
    const [agencyId] = args
    if (!agencyId) throw new Error('usage: members <AGENCY_ID>')
    const { data, error } = await supabase
      .from('agency_members')
      .select('id, role, created_at, profiles!inner(id, display_name, country)')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: true })

    if (error) {
      console.log('members =>', { data: null, error })
    } else {
      console.log(`members of ${agencyId} (${data.length})`)
      data.forEach(m =>
        console.log(`${m.profiles.id}\t${m.profiles.display_name ?? '—'}\t${m.role}\t${m.created_at}`)
      )
    }
    return
  }

  console.log('usage: node scripts/supa-invite.mjs [invite|list|accept|my-agencies|members] ...')
  process.exit(1)
}

await main()