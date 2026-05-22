import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageCircle, BookOpen, Video } from "lucide-react";

export default function Help() {
  const { t } = useTranslation();

  const faqs = [
    { q: "How do I add a new product?", a: "Go to Products > Add Product. Fill in the name, price, and stock quantity. You can also upload an image and set a barcode." },
    { q: "How does the POS work?", a: "Click on any product to add it to the cart. Use the barcode scanner for quick entry. Click Pay to complete the sale." },
    { q: "How do I add an employee with PIN login?", a: "Go to Employees > Add Employee. Fill in their details and set a 4-10 digit PIN. They can log in using the PIN tab on the login screen." },
    { q: "How do I configure my receipt printer?", a: "Go to Settings > Printers > Add Printer. Select the type (thermal/inkjet/laser) and connection method (USB/Network/Bluetooth)." },
    { q: "How do I change the language?", a: "Go to Settings > Language and select English or Spanish. You can also use the language toggle in the top bar." },
    { q: "What is the membership price?", a: "The membership is $19.99/month after a 30-day free trial." },
    { q: "How do I pause a sale?", a: "In the POS, click the pause button to hold the current sale. You can resume it later from the Held Orders dialog." },
    { q: "How do I generate payroll?", a: "Go to Employees > Payroll tab. Click Generate Payroll, select the employee, period, and amounts." },
  ];

  const resources = [
    { icon: BookOpen, title: "User Guide", desc: "Complete documentation" },
    { icon: Video, title: "Video Tutorials", desc: "Step-by-step videos" },
    { icon: MessageCircle, title: "Live Chat", desc: "Chat with support" },
    { icon: Mail, title: "Email Support", desc: "support@vapeshopro.com" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold dark:text-white mb-2">{t("help")}</h1>
        <p className="text-muted-foreground">Find answers and get support for VapeShopPro</p>
      </div>

      {/* Quick Resources */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {resources.map((r) => (
          <Card key={r.title} className="hover:shadow-lg transition-all cursor-pointer text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white mx-auto mb-3">
                <r.icon className="w-6 h-6" />
              </div>
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-500" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">Still need help?</p>
            <p className="text-sm text-slate-400">Our support team is available 24/7</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <Mail className="w-4 h-4 mr-2" /> Contact Support
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">VapeShopPro v1.0 - {t("poweredBy")}</p>
    </div>
  );
}
