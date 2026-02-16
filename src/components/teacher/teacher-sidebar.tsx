'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TeacherSidebarProps {
  teacherName: string
  teacherSubject?: string
}

const navItems = [
  { href: '/report', icon: '📊', label: '학생 리포트' },
  { href: '/exam', icon: '📝', label: '시험 출제' },
  { href: '/lesson', icon: '📖', label: '교안 생성' },
  { href: '/grading', icon: '📋', label: '과제 현황' },
]

function SidebarContent({
  teacherName,
  teacherSubject = '수학',
  currentPath,
  onLogout,
}: {
  teacherName: string
  teacherSubject?: string
  currentPath: string
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Teacher Info */}
      <div className="border-b p-4">
        <p className="font-semibold">{teacherName}</p>
        <p className="text-sm text-muted-foreground">{teacherSubject}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              currentPath === item.href
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <Button onClick={onLogout} variant="outline" className="w-full">
          로그아웃
        </Button>
      </div>
    </div>
  )
}

export function TeacherSidebar({ teacherName, teacherSubject }: TeacherSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 border-r bg-background lg:block">
        <SidebarContent
          teacherName={teacherName}
          teacherSubject={teacherSubject}
          currentPath={pathname}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Header + Sheet */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="fixed left-0 right-0 top-0 z-50 border-b bg-background p-4">
          <Button variant="ghost" onClick={() => setMobileOpen(true)}>
            ☰ Menu
          </Button>
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-60 p-0">
            <SheetTitle className="sr-only">메뉴</SheetTitle>
            <SheetDescription className="sr-only">
              교사 네비게이션 메뉴
            </SheetDescription>
            <SidebarContent
              teacherName={teacherName}
              teacherSubject={teacherSubject}
              currentPath={pathname}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
