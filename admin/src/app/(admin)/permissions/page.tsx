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
  Button,
  Badge,
} from "@gerai-one/shared-ui"
import { Lock, Save, RefreshCcw, Loader2, Check } from "lucide-react"

export default function PermissionsPage() {
  const queryClient = useQueryClient()
  const [matrixState, setMatrixState] = useState<Record<string, string[]>>({})

  const { data: permRes, isLoading } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const res = await adminApi.getPermissions()
      if (res.data?.matrix) {
        setMatrixState(res.data.matrix)
      }
      return res
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updatePermissions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] })
    },
  })

  const availablePermissions = permRes?.data?.availablePermissions || []
  const rolesList = ["SUPER_ADMIN", "ADMIN", "USER"]

  const togglePermission = (role: string, permKey: string) => {
    setMatrixState((prev) => {
      const currentList = prev[role] || []
      const exists = currentList.includes(permKey)
      const nextList = exists
        ? currentList.filter((p) => p !== permKey)
        : [...currentList, permKey]
      return { ...prev, [role]: nextList }
    })
  }

  const handleSave = () => {
    updateMutation.mutate({ rolePermissions: matrixState })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="h-6 w-6 text-indigo-600" />
            RBAC Permission Matrix
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure access permission rules across administrative roles.
          </p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2 cursor-pointer">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving..." : "Save Permission Matrix"}
        </Button>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Permission Key & Name</TableHead>
                  <TableHead>Category</TableHead>
                  {rolesList.map((r) => (
                    <TableHead key={r} className="text-center w-32">
                      <Badge variant={r === "SUPER_ADMIN" ? "default" : r === "ADMIN" ? "secondary" : "outline"}>
                        {r}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {availablePermissions.map((perm: any) => (
                  <TableRow key={perm.key}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{perm.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{perm.key}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-500">{perm.category}</span>
                    </TableCell>
                    {rolesList.map((role) => {
                      const isChecked = (matrixState[role] || []).includes(perm.key)
                      return (
                        <TableCell key={role} className="text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(role, perm.key)}
                            disabled={role === "SUPER_ADMIN"} // Super Admin always holds all permissions
                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
