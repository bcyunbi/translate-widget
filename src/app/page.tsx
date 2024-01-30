"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TranslateWidget } from "@/components/translateWidget";
import TranslateSwitch from "@/components/translateWidget/TranslateSwitch";
import { Toaster, toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
export default function Home() {
  return (
    <div id="main" className="h-screen w-screen p-2 relative">
      <Toaster />
      測試
      <Button>中文</Button>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>橘子</AccordionContent>
        </AccordionItem>
      </Accordion>
      <TranslateWidget />
      <TranslateSwitch />
      <Button
        variant="outline"
        onClick={() =>
          toast("蘋果", {
            description: "蘋果內容",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Show Toast
      </Button>
      <HoverCard open={true}>
        <HoverCardTrigger>滑滑</HoverCardTrigger>
        <HoverCardContent>卡片</HoverCardContent>
      </HoverCard>
    </div>
  );
}
