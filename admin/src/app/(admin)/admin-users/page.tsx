"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Input,
  Pagination,
  Button,
  Dialog,
} from "@gerai-one/shared-ui"
import {
  Search,
  Loader2,
  Plus,
  Edit2,
  UserX,
  UserCheck,
  RefreshCcw,
  ShieldCheck,
  AlertOctagon,
} from "lucide-react"

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)

  // Form Fields
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN")
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")

  const {
    data: adminRes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-users-list", page, search],
    queryFn: () => adminApi.getAdminUsers({ page, limit, search }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] })
      setIsEditOpen(false)
    },
  })

  const resetForm = () => {
    setEmail("")
    setFullName("")
    setRole("ADMIN")
    setStatus("ACTIVE")
  }

  const openCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const openEdit = (admin: any) => {
    setSelectedAdmin(admin)
    setFullName(admin.fullName || "")
    setRole(admin.role || "ADMIN")
    setStatus(admin.status || "ACTIVE")
    setIsEditOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ email, fullName, role, status })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmin) return
    updateMutation.mutate({
      id: selectedAdmin.id,
      data: { fullName, role, status },
    })
  }

  const toggleAdminStatus = (admin: any) => {
    const nextStatus = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    updateMutation.mutate({ id: admin.id, data: { status: nextStatus } })
  }

  const adminUsers = adminRes?.data?.adminUsers || []
  const meta = adminRes?.data?.meta

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            Admin Users Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage system administrators, assign roles, and control active console access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={openCreate} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Admin User
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search admin name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9.5 w-full bg-slate-50/50 dark:bg-slate-950/30"
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-3">
          <AlertOctagon className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : "Failed to load admin users."}
          </p>
        </div>
      )}

      {/* Table Container */}
      {!isError && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 font-medium">Loading admin users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Avatar</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                          No admin users found matching search criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      adminUsers.map((admin: any) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                              {admin.fullName ? admin.fullName[0].toUpperCase() : "A"}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                            {admin.fullName || "Admin User"}
                          </TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <Badge variant={admin.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                              {admin.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={admin.status === "ACTIVE" ? "success" : "destructive"}>
                              {admin.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEdit(admin)}
                                className="h-8 w-8 p-0 text-indigo-600 cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleAdminStatus(admin)}
                                className={`h-8 w-8 p-0 cursor-pointer ${
                                  admin.status === "ACTIVE" ? "text-amber-600" : "text-emerald-600"
                                }`}
                              >
                                {admin.status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="p-4 border-t border-slate-150 bg-slate-50/50">
                  <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => setPage(p)} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Admin Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Administrator">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Admin Name" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
              className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-xs"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Admin User"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Administrator">
        {selectedAdmin && (
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
                className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  )
}
