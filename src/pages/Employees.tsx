import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export default function Employees() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("employees");
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [payrollForm, setPayrollForm] = useState<any>({});
  const [loanForm, setLoanForm] = useState<any>({});

  const { data: employees } = trpc.employee.list.useQuery({ search: search || undefined });
  const { data: payrolls } = trpc.employee.payrollList.useQuery();
  const { data: loans } = trpc.employee.loanList.useQuery();
  const utils = trpc.useUtils();

  const createEmp = trpc.employee.create.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); setShowEmpForm(false); } });
  const updateEmp = trpc.employee.update.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); setShowEmpForm(false); } });
  const deleteEmp = trpc.employee.delete.useMutation({ onSuccess: () => utils.employee.list.invalidate() });
  const createPayroll = trpc.employee.payrollCreate.useMutation({ onSuccess: () => { utils.employee.payrollList.invalidate(); setShowPayrollForm(false); } });
  const createLoan = trpc.employee.loanCreate.useMutation({ onSuccess: () => { utils.employee.loanList.invalidate(); setShowLoanForm(false); } });
  const updatePayroll = trpc.employee.payrollUpdateStatus.useMutation({ onSuccess: () => utils.employee.payrollList.invalidate() });
  const updateLoan = trpc.employee.loanUpdate.useMutation({ onSuccess: () => utils.employee.loanList.invalidate() });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("employees")}</h1>
        <Button onClick={() => { setEditing(null); setForm({}); setShowEmpForm(true); }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> {t("addEmployee")}
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="employees">{t("employees")}</TabsTrigger>
          <TabsTrigger value="payroll">{t("payroll")}</TabsTrigger>
          <TabsTrigger value="loans">{t("loans")}</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees?.map((emp) => (
              <Card key={emp.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {emp.image ? <img src={emp.image} alt={emp.name} className="w-16 h-16 rounded-full object-cover" /> : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">{emp.name.charAt(0)}</div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{emp.name}</p>
                      <p className="text-sm text-muted-foreground">{emp.position}</p>
                      <p className="text-sm text-muted-foreground">{emp.department}</p>
                      <p className="text-sm text-cyan-600 font-medium">${Number(emp.salary || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditing(emp); setForm(emp); setShowEmpForm(true); }}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteEmp.mutate({ id: emp.id })}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  {emp.pin && <p className="text-xs text-muted-foreground font-mono mt-2">PIN: ****</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="payroll">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => { setPayrollForm({}); setShowPayrollForm(true); }}><Plus className="w-4 h-4 mr-1" /> {t("generatePayroll")}</Button>
          </div>
          <div className="space-y-2">
            {payrolls?.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.employee?.name}</p>
                    <p className="text-xs text-muted-foreground">{String(p.periodStart)} - {String(p.periodEnd)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-cyan-600">${Number(p.totalPay).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === "paid" ? "bg-emerald-100 text-emerald-700" : p.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                    {p.status === "pending" && (
                      <Button size="sm" onClick={() => updatePayroll.mutate({ id: p.id, status: "paid" })}>{t("payPayroll")}</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="loans">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => { setLoanForm({}); setShowLoanForm(true); }}><Plus className="w-4 h-4 mr-1" /> {t("addLoan")}</Button>
          </div>
          <div className="space-y-2">
            {loans?.map((l) => (
              <Card key={l.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{l.employee?.name}</p>
                    <p className="text-xs text-muted-foreground">{l.reason}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">${Number(l.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">${Number(l.remaining).toFixed(2)} {t("remaining")}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${l.status === "active" ? "bg-amber-100 text-amber-700" : l.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span>
                    {l.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => updateLoan.mutate({ id: l.id, status: "paid" })}>{t("markPaid")}</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Employee Form */}
      <Dialog open={showEmpForm} onOpenChange={setShowEmpForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("editEmployee") : t("addEmployee")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (editing) updateEmp.mutate({ id: editing.id, ...form }); else createEmp.mutate(form); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("name")} *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("phone")}</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("email")}</Label><Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("idCard")}</Label><Input value={form.idCard || ""} onChange={(e) => setForm({ ...form, idCard: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("position")}</Label><Input value={form.position || ""} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("department")}</Label><Input value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("salary")}</Label><Input type="number" value={form.salary || ""} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("pinCode")}</Label><Input value={form.pin || ""} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="4-10 digits" /></div>
            </div>
            <div className="space-y-2"><Label>{t("hireDate")}</Label><Input type="date" value={form.hireDate || ""} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
              <Button type="button" variant="outline" onClick={() => setShowEmpForm(false)}>{t("cancel")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payroll Form */}
      <Dialog open={showPayrollForm} onOpenChange={setShowPayrollForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("generatePayroll")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createPayroll.mutate(payrollForm); }} className="space-y-3">
            <div className="space-y-2"><Label>{t("employee")}</Label>
              <select value={payrollForm.employeeId || ""} onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: Number(e.target.value) })} className="w-full h-9 rounded-md border border-input bg-transparent px-3" required>
                <option value="">Select...</option>
                {employees?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("periodStart")}</Label><Input type="date" value={payrollForm.periodStart || ""} onChange={(e) => setPayrollForm({ ...payrollForm, periodStart: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("periodEnd")}</Label><Input type="date" value={payrollForm.periodEnd || ""} onChange={(e) => setPayrollForm({ ...payrollForm, periodEnd: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("baseSalary")}</Label><Input type="number" value={payrollForm.baseSalary || ""} onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("overtime")}</Label><Input type="number" value={payrollForm.overtime || "0"} onChange={(e) => setPayrollForm({ ...payrollForm, overtime: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>{t("commission")}</Label><Input type="number" value={payrollForm.commission || "0"} onChange={(e) => setPayrollForm({ ...payrollForm, commission: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("bonus")}</Label><Input type="number" value={payrollForm.bonus || "0"} onChange={(e) => setPayrollForm({ ...payrollForm, bonus: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("deductions")}</Label><Input type="number" value={payrollForm.deductions || "0"} onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t("totalPay")}</Label><Input type="number" value={payrollForm.totalPay || ""} onChange={(e) => setPayrollForm({ ...payrollForm, totalPay: e.target.value })} required /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
              <Button type="button" variant="outline" onClick={() => setShowPayrollForm(false)}>{t("cancel")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loan Form */}
      <Dialog open={showLoanForm} onOpenChange={setShowLoanForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("addLoan")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createLoan.mutate({ ...loanForm, remaining: loanForm.amount }); }} className="space-y-3">
            <div className="space-y-2"><Label>{t("employee")}</Label>
              <select value={loanForm.employeeId || ""} onChange={(e) => setLoanForm({ ...loanForm, employeeId: Number(e.target.value) })} className="w-full h-9 rounded-md border border-input bg-transparent px-3" required>
                <option value="">Select...</option>
                {employees?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("loanAmount")}</Label><Input type="number" value={loanForm.amount || ""} onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("installments")}</Label><Input type="number" value={loanForm.installments || 1} onChange={(e) => setLoanForm({ ...loanForm, installments: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>{t("loanReason")}</Label><Input value={loanForm.reason || ""} onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
              <Button type="button" variant="outline" onClick={() => setShowLoanForm(false)}>{t("cancel")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
