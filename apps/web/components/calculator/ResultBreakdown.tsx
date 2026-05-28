'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Info, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCalculatorStore } from '@/stores/calculator.store';
import { formatAmount, type Currency } from '@/lib/formatters';
import type { CalculationResultDto } from '@vitauto/shared-types';

interface Props {
  result: CalculationResultDto;
}

function LineItem({
  label,
  value,
  indent,
  tooltip,
  fmt,
}: {
  label: string;
  value: number;
  indent?: boolean;
  tooltip?: string;
  fmt: (usd: number) => string;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1 text-sm ${
        indent ? 'pl-4 text-muted-foreground' : ''
      }`}
    >
      <span className="flex items-center gap-1">
        {label}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-xs">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span>{fmt(value)}</span>
    </div>
  );
}

export default function ResultBreakdown({ result }: Props) {
  const t = useTranslations('Calculator');
  const locale = useLocale();
  const { currency, convertAmount } = useCalculatorStore();

  const fmt = (usd: number) => formatAmount(convertAmount(usd), currency as Currency, locale);

  return (
    <div>
      <Accordion type="multiple" defaultValue={['first', 'second', 'third']}>
        {/* First Payment */}
        <AccordionItem value="first">
          <AccordionTrigger className="text-sm font-semibold">
            {t('result.firstPayment')}
          </AccordionTrigger>
          <AccordionContent>
            <LineItem label={t('result.lotPrice')} value={result.firstPayment.lotPrice} fmt={fmt} />

            {/* Nested auction fees accordion */}
            <Accordion type="single" collapsible>
              <AccordionItem value="auction" className="border-0">
                <AccordionTrigger className="py-1 text-sm hover:no-underline [&>svg]:hidden">
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1">
                      {t('result.auctionFees')}
                      <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </span>
                    <span>{fmt(result.firstPayment.auctionFees.total)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <LineItem
                    label={t('result.auctionBuyerFee')}
                    value={result.firstPayment.auctionFees.buyerFee}
                    indent
                    fmt={fmt}
                  />
                  <LineItem
                    label={t('result.auctionProxyFee')}
                    value={result.firstPayment.auctionFees.proxyFee}
                    indent
                    fmt={fmt}
                  />
                  <LineItem
                    label={t('result.auctionFixedFees')}
                    value={result.firstPayment.auctionFees.fixedFees}
                    indent
                    fmt={fmt}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {result.firstPayment.landDelivery > 0 && (
              <LineItem
                label={t('result.landDelivery')}
                value={result.firstPayment.landDelivery}
                fmt={fmt}
              />
            )}
            <LineItem
              label={t('result.seaShipping')}
              value={result.firstPayment.seaShipping}
              fmt={fmt}
            />
            {result.firstPayment.bankFee > 0 && (
              <LineItem label={t('result.bankFee')} value={result.firstPayment.bankFee} fmt={fmt} />
            )}

            <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-semibold">
              <span>{t('result.blockTotal')}</span>
              <span>{fmt(result.firstPayment.total)}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Second Payment */}
        <AccordionItem value="second">
          <AccordionTrigger className="text-sm font-semibold">
            {t('result.secondPayment')}
          </AccordionTrigger>
          <AccordionContent>
            <LineItem
              label={t('result.expeditor')}
              value={result.secondPayment.expeditor}
              fmt={fmt}
            />
            <LineItem
              label={t('result.deliveryToUA')}
              value={result.secondPayment.deliveryToUA}
              fmt={fmt}
            />
            <LineItem
              label={t('result.terminalFees')}
              value={result.secondPayment.terminalFees}
              fmt={fmt}
            />
            <LineItem
              label={t('result.brokerFee')}
              value={result.secondPayment.brokerFee}
              fmt={fmt}
            />
            <LineItem
              label={t('result.deliveryToSTO')}
              value={result.secondPayment.deliveryToSTO}
              fmt={fmt}
            />
            <LineItem
              label={t('result.customsDuty')}
              value={result.secondPayment.customsDuty}
              fmt={fmt}
            />
            <LineItem label={t('result.excise')} value={result.secondPayment.excise} fmt={fmt} />
            <LineItem label={t('result.vat')} value={result.secondPayment.vat} fmt={fmt} />

            <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-semibold">
              <span>{t('result.blockTotal')}</span>
              <span>{fmt(result.secondPayment.total)}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Third Payment */}
        <AccordionItem value="third">
          <AccordionTrigger className="text-sm font-semibold">
            {t('result.thirdPayment')}
          </AccordionTrigger>
          <AccordionContent>
            <LineItem
              label={t('result.repairPrice')}
              value={result.thirdPayment.repairPrice}
              tooltip={t('result.repairPriceTooltip')}
              fmt={fmt}
            />
            <LineItem
              label={t('result.certification')}
              value={result.thirdPayment.certification}
              fmt={fmt}
            />
            <LineItem
              label={t('result.pensionFund')}
              value={result.thirdPayment.pensionFund}
              fmt={fmt}
            />
            <LineItem label={t('result.mreo')} value={result.thirdPayment.mreo} fmt={fmt} />

            <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-semibold">
              <span>{t('result.blockTotal')}</span>
              <span>{fmt(result.thirdPayment.total)}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Total turnkey */}
      <div className="mt-4 rounded-lg bg-primary/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">{t('result.totalTurnkey')}</span>
          <span className="text-xl font-bold text-primary">{fmt(result.totalUSD)}</span>
        </div>
      </div>

      {/* NBU rate */}
      <p className="mt-2 text-right text-xs text-muted-foreground">
        {t('result.nbuRate', { rate: result.rates.usdUah.toFixed(2) })}
      </p>
    </div>
  );
}
