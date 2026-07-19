"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Input, Dialog, Badge } from "@gerai-one/shared-ui"
import { Sliders, Plus, Edit2, Trash2, Loader2, X, RefreshCcw } from "lucide-react"

export default function AttributesPage() {
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttr, setEditingAttr] = useState<any>(null)

  const [name, setName] = useState("")
  const [valInput, setValInput] = useState("")
  const [valuesList, setValuesList] = useState<string[]>([])

  const { data: attrRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-attributes"],
    queryFn: () => adminApi.getAttributes(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] })
    },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAttr(null)
    setName("")
    setValInput("")
    setValuesList([])
  }

  const openCreate = () => {
    closeModal()
    setIsModalOpen(true)
  }

  const openEdit = (attr: any) => {
    setEditingAttr(attr)
    setName(attr.name)
    setValuesList(attr.values?.map((v: any) => v.value) || [])
    setIsModalOpen(true)
  }

  const addValueTag = () => {
    if (valInput.trim() && !valuesList.includes(valInput.trim())) {
      setValuesList([...valuesList, valInput.trim()])
      setValInput("")
    }
  }

  const removeValueTag = (val: string) => {
    setValuesList(valuesList.filter((v) => v !== val))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAttr) {
      updateMutation.mutate({ id: editingAttr.id, data: { name, values: valuesList } })
    } else {
      createMutation.mutate({ name, values: valuesList })
    }
  }

  const attributes = attrRes?.data || []

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-indigo-600" /> Product Attributes
          </h1>
          <p className="text-sm text-slate-500">Configure global variant option attributes like Color, Size, Storage, and Material.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={openCreate} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Attribute
          </Button>
        </div>
      </div>

      {/* Attributes Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {attributes.map((attr: any) => (
            <div
              key={attr.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{attr.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(attr)} className="h-7 w-7 p-0 text-indigo-600 cursor-pointer">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(attr.id)} className="h-7 w-7 p-0 text-red-600 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Available Values</span>
                  <div className="flex flex-wrap gap-1.5">
                    {attr.values && attr.values.length > 0 ? (
                      attr.values.map((v: any) => (
                        <Badge key={v.id} variant="outline" className="text-xs bg-slate-50 font-mono">
                          {v.value}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No values configured</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Attribute Modal */}
      <Dialog isOpen={isModalOpen} onClose={closeModal} title={editingAttr ? "Edit Attribute" : "Add New Attribute"}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Attribute Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Color, Size, Storage" required />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Values List</label>
            <div className="flex gap-2">
              <Input
                value={valInput}
                onChange={(e) => setValInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValueTag(); } }}
                placeholder="e.g. Red, Black, White"
              />
              <Button type="button" onClick={addValueTag} variant="outline">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {valuesList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {valuesList.map((val) => (
                  <span key={val} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-semibold">
                    {val}
                    <button type="button" onClick={() => removeValueTag(val)} className="hover:text-indigo-900 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingAttr ? "Save Attribute" : "Create Attribute"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
