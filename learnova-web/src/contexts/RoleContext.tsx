'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'

export type UserRole = 'student' | 'founder' | null

interface RoleContextType {
  role: UserRole
  roleLoading: boolean
  refreshRole: () => Promise<void>
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  roleLoading: true,
  refreshRole: async () => {},
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole>(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchRole = async () => {
    if (!user) {
      setRole(null)
      setRoleLoading(false)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    setRole((data?.role as UserRole) || null)
    setRoleLoading(false)
  }

  useEffect(() => {
    setRoleLoading(true)
    fetchRole()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <RoleContext.Provider value={{ role, roleLoading, refreshRole: fetchRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
