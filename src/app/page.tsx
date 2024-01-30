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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default function Home() {
  return (
    <div className="w-full max-w-screen-lg">
      <Toaster />
      <TranslateWidget />
      <TranslateSwitch />
      <div className="py-5">
        | Toaster |
        <div>
          <Button
            variant="outline"
            onClick={() =>
              toast("通知出現！！", {
                description: "通知內容 123",
                action: {
                  label: "返回",
                  onClick: () => console.log("Undo"),
                },
              })
            }
          >
            Show Toast
          </Button>
        </div>
      </div>
      <div className="py-5">| Card |</div>
      <Card>
        <CardHeader>
          <CardTitle>測試按鈕</CardTitle>
          <CardDescription>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">hover 按鈕</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">標題</h4>
                    <p className="text-sm">文字內容</p>
                    <div className="flex items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        小字
                      </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <Button>預設</Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle>測試文字</CardTitle>
          <CardDescription>文字段落 TEST</CardDescription>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>測試收合</AccordionTrigger>
              <AccordionContent>測試收合內容</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      <div className="py-5">| Table |</div>
      <Table>
        <TableCaption>最近發票的清單。</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">發票號碼</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>支付方式</TableHead>
            <TableHead className="text-right">金額</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TableData.map((item) => {
            return (
              <TableRow key={item.invId}>
                <TableCell className="font-medium">{item.invId}</TableCell>
                <TableCell>{item.paid ? "已支付" : "未支付"}</TableCell>
                <TableCell>{item.type || "--"}</TableCell>
                <TableCell className="text-right">{item.total}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const TableData = [
  {
    invId: "INV001",
    status: true,
    type: "信用卡",
    total: "$250.00",
  },
  {
    invId: "INV002",
    status: true,
    type: "信用卡",
    total: "$800.00",
  },
  {
    invId: "INV003",
    status: false,
    type: null,
    total: "$50.00",
  },
  {
    invId: "INV004",
    status: false,
    type: null,
    total: "$20.00",
  },
  {
    invId: "INV005",
    paid: true,
    type: "現金",
    total: "$1250.00",
  },
];
