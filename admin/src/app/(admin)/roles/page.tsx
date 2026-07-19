"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Badge, Dialog, Input } from "@gerai-one/shared-ui"
import { KeyRound, Plus, Shield, Users, CheckCircle, Edit2, Loader2 } from "lucide-react"

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roleName, setRoleName] = useState("")
  const [description, setDescription] = useState("")

  const { data: rolesRes, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminApi.getRoles(),
  })

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => adminApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      setIsModalOpen(false)
      setRoleName("")
      setDescription("")
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createRoleMutation.mutate({ name: roleName, description })
  }

  const roles = rolesRes?.data || []

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-indigo-600" />
            Role Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define system authorization roles and permissions architecture for administrators and users.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" /> Create Custom Role
        </Button>
      </div>

      {/* Role Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role: any) => (
            <div
              key={role.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={role.name === "SUPER_ADMIN" ? "default" : role.name === "ADMIN" ? "secondary" : "outline"}>
                    {role.name}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {role.userCount} Accounts
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{role.displayName || role.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{role.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capabilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions?.map((perm: string) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Custom Role Dialog */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Custom Role">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Role Identifier Name</label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. INVENTORY_MANAGER"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational responsibilities..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? "Creating..." : "Save Role"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
