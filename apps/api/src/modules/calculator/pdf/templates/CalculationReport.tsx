import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CalculationBreakdown, CalculationInputs, ExchangeRates } from '@vitauto/shared-types';

const COLORS = {
  primary: '#0a2540',
  accent: '#10b981',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
    padding: 36,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  logo: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: COLORS.primary },
  logoAccent: { color: COLORS.accent },
  meta: { textAlign: 'right', color: COLORS.gray, fontSize: 8 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 6,
    marginTop: 14,
  },
  vehicleBlock: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  vehicleRow: { flexDirection: 'row', marginBottom: 3 },
  vehicleLabel: { color: COLORS.gray, width: 110 },
  vehicleValue: { fontFamily: 'Helvetica-Bold' },
  paymentBlock: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  paymentHeader: {
    backgroundColor: COLORS.primary,
    padding: '6 10',
    color: COLORS.white,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', padding: '4 10' },
  lineRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '4 10',
    backgroundColor: COLORS.lightGray,
  },
  lineLabel: { color: COLORS.gray },
  lineValue: {},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '6 10',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#f0fdf4',
  },
  totalLabel: { fontFamily: 'Helvetica-Bold' },
  totalValue: { fontFamily: 'Helvetica-Bold', color: COLORS.accent },
  grandTotalBlock: { marginTop: 10, padding: 12, backgroundColor: COLORS.primary, borderRadius: 4 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  grandTotalLabel: { color: COLORS.white, opacity: 0.8 },
  grandTotalValue: { color: COLORS.white, fontFamily: 'Helvetica-Bold' },
  grandTotalMain: { fontSize: 13, color: COLORS.accent, fontFamily: 'Helvetica-Bold' },
  rateNote: { marginTop: 10, color: COLORS.gray, fontSize: 8 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  footerText: { color: COLORS.gray, fontSize: 7.5, textAlign: 'center' },
  footerDisclaimer: { color: COLORS.gray, fontSize: 7, textAlign: 'center', marginTop: 3 },
});

const LABELS: Record<'uk' | 'en', Record<string, string>> = {
  uk: {
    generated: 'Сформовано',
    vehicleInfo: 'Інформація про авто',
    year: 'Рік випуску',
    fuelType: 'Тип палива',
    condition: 'Стан на аукціоні',
    lotPrice: 'Ціна лоту',
    firstPayment: '1-й платіж — Аукціон та доставка до України',
    auctionBuyerFee: 'Збір покупця',
    auctionProxyFee: 'Proxy-збір',
    auctionFixedFees: 'Фіксовані збори',
    totalAuction: 'Разом аукціонні збори',
    seaShipping: 'Морське фрахтування',
    total: 'Всього',
    secondPayment: '2-й платіж — Митниця та доставка в Україні',
    ukraineDelivery: 'Доставка по Україні',
    customsDuty: 'Мито',
    excise: 'Акциз',
    vat: 'ПДВ',
    totalCustoms: 'Разом митні платежі',
    thirdPayment: '3-й платіж — Реєстрація',
    pensionFund: 'Пенсійний фонд',
    registration: 'Реєстрація (ТО + МРЕО)',
    grandTotal: 'Загальна вартість',
    totalUsd: 'Всього USD',
    totalUah: 'Всього UAH',
    totalEur: 'Всього EUR',
    nbuRate: 'Курс НБУ на',
    nbuRateValue: '1 USD =',
    nbuRateUah: 'UAH',
    footer: 'VitAuto · hi@vitauto.ua · vitauto.ua',
    disclaimer: 'Розрахунок є інформаційним. Остаточна вартість підтверджується менеджером.',
    PETROL: 'Бензин',
    DIESEL: 'Дизель',
    ELECTRIC: 'Електро',
    HYBRID: 'Гібрид',
    RUN_AND_DRIVE: 'На ходу',
    ENGINE_START: 'Заводиться',
    STATIONARY: 'Не заводиться',
    ENHANCED_VEHICLE: 'Покращений',
  },
  en: {
    generated: 'Generated',
    vehicleInfo: 'Vehicle Information',
    year: 'Year',
    fuelType: 'Fuel Type',
    condition: 'Auction Condition',
    lotPrice: 'Lot Price',
    firstPayment: '1st Payment — Auction & Shipping',
    auctionBuyerFee: "Buyer's fee",
    auctionProxyFee: 'Proxy fee',
    auctionFixedFees: 'Fixed fees',
    totalAuction: 'Total auction fees',
    seaShipping: 'Sea shipping',
    total: 'Total',
    secondPayment: '2nd Payment — Customs & Ukraine Delivery',
    ukraineDelivery: 'Ukraine delivery',
    customsDuty: 'Customs duty',
    excise: 'Excise',
    vat: 'VAT',
    totalCustoms: 'Total customs',
    thirdPayment: '3rd Payment — Registration',
    pensionFund: 'Pension fund',
    registration: 'Registration (inspection + DMV)',
    grandTotal: 'Grand Total',
    totalUsd: 'Total USD',
    totalUah: 'Total UAH',
    totalEur: 'Total EUR',
    nbuRate: 'NBU rate as of',
    nbuRateValue: '1 USD =',
    nbuRateUah: 'UAH',
    footer: 'VitAuto · hi@vitauto.ua · vitauto.ua',
    disclaimer: 'Calculation is informational. Final cost confirmed by manager.',
    PETROL: 'Petrol',
    DIESEL: 'Diesel',
    ELECTRIC: 'Electric',
    HYBRID: 'Hybrid',
    RUN_AND_DRIVE: 'Run & Drive',
    ENGINE_START: 'Engine Start',
    STATIONARY: 'Stationary',
    ENHANCED_VEHICLE: 'Enhanced',
  },
};

function formatUsd(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}

function formatDate(d: Date, lang: 'uk' | 'en') {
  return d.toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface ReportProps {
  id: string;
  inputs: CalculationInputs;
  result: CalculationBreakdown;
  rates: ExchangeRates;
  createdAt: Date;
  lang: 'uk' | 'en';
}

export function CalculationReport({ id, inputs, result, rates, createdAt, lang }: ReportProps) {
  const t = LABELS[lang];

  const first =
    result.lotPrice +
    result.auctionBuyerFee +
    result.auctionProxyFee +
    result.auctionFixedFees +
    result.seaShipping;
  const second = result.ukraineDelivery + result.totalCustoms;
  const third = result.pensionFund + result.registration;

  const totalUsd = result.totalCost;
  const totalUah = Math.round(totalUsd * rates.usdUah);
  const totalEur = Math.round(totalUsd / rates.eurUsd);

  return (
    <Document title={`VitAuto Calculation ${id}`} author="VitAuto">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            Vit<Text style={styles.logoAccent}>Auto</Text>
          </Text>
          <View style={styles.meta}>
            <Text>{`${t.generated}: ${formatDate(createdAt, lang)}`}</Text>
            <Text>{`ID: ${id}`}</Text>
          </View>
        </View>

        {/* Vehicle info */}
        <Text style={styles.sectionTitle}>{t.vehicleInfo}</Text>
        <View style={styles.vehicleBlock}>
          {[
            [t.year, String(inputs.year)],
            [t.fuelType, t[inputs.fuelType] ?? inputs.fuelType],
            [t.condition, t[inputs.auctionCondition] ?? inputs.auctionCondition],
            [t.lotPrice, formatUsd(inputs.lotPrice)],
          ].map(([label, value]) => (
            <View key={label} style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>{label}</Text>
              <Text style={styles.vehicleValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* First Payment */}
        <Text style={styles.sectionTitle}>{t.firstPayment}</Text>
        <View style={styles.paymentBlock}>
          <Text style={styles.paymentHeader}>{`${t.lotPrice}: ${formatUsd(result.lotPrice)}`}</Text>
          {[
            [t.auctionBuyerFee, result.auctionBuyerFee],
            [t.auctionProxyFee, result.auctionProxyFee],
            [t.auctionFixedFees, result.auctionFixedFees],
          ].map(([label, val], i) => (
            <View key={String(label)} style={i % 2 === 0 ? styles.lineRowAlt : styles.lineRow}>
              <Text style={styles.lineLabel}>{label}</Text>
              <Text style={styles.lineValue}>{formatUsd(Number(val))}</Text>
            </View>
          ))}
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>{t.totalAuction}</Text>
            <Text style={styles.lineValue}>{formatUsd(result.totalAuctionFees)}</Text>
          </View>
          <View style={styles.lineRowAlt}>
            <Text style={styles.lineLabel}>{t.seaShipping}</Text>
            <Text style={styles.lineValue}>{formatUsd(result.seaShipping)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.total}</Text>
            <Text style={styles.totalValue}>{formatUsd(first)}</Text>
          </View>
        </View>

        {/* Second Payment */}
        <Text style={styles.sectionTitle}>{t.secondPayment}</Text>
        <View style={styles.paymentBlock}>
          {[
            [t.ukraineDelivery, result.ukraineDelivery],
            [t.customsDuty, result.customsDuty],
            [t.excise, result.customsExcise],
            [t.vat, result.customsVat],
          ].map(([label, val], i) => (
            <View key={String(label)} style={i % 2 === 0 ? styles.lineRowAlt : styles.lineRow}>
              <Text style={styles.lineLabel}>{label}</Text>
              <Text style={styles.lineValue}>{formatUsd(Number(val))}</Text>
            </View>
          ))}
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>{t.totalCustoms}</Text>
            <Text style={styles.lineValue}>{formatUsd(result.totalCustoms)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.total}</Text>
            <Text style={styles.totalValue}>{formatUsd(second)}</Text>
          </View>
        </View>

        {/* Third Payment */}
        <Text style={styles.sectionTitle}>{t.thirdPayment}</Text>
        <View style={styles.paymentBlock}>
          {[
            [t.pensionFund, result.pensionFund],
            [t.registration, result.registration],
          ].map(([label, val], i) => (
            <View key={String(label)} style={i % 2 === 0 ? styles.lineRowAlt : styles.lineRow}>
              <Text style={styles.lineLabel}>{label}</Text>
              <Text style={styles.lineValue}>{formatUsd(Number(val))}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.total}</Text>
            <Text style={styles.totalValue}>{formatUsd(third)}</Text>
          </View>
        </View>

        {/* Grand Total */}
        <View style={styles.grandTotalBlock}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>{t.totalUsd}</Text>
            <Text style={styles.grandTotalMain}>{formatUsd(totalUsd)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>{t.totalUah}</Text>
            <Text style={styles.grandTotalValue}>{`${totalUah.toLocaleString('en-US')} ₴`}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>{t.totalEur}</Text>
            <Text style={styles.grandTotalValue}>{`€${totalEur.toLocaleString('en-US')}`}</Text>
          </View>
        </View>

        {/* NBU rate note */}
        <Text style={styles.rateNote}>
          {`${t.nbuRate} ${rates.ratesDate}: ${t.nbuRateValue} ${rates.usdUah.toFixed(2)} ${t.nbuRateUah}`}
        </Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{t.footer}</Text>
          <Text style={styles.footerDisclaimer}>{t.disclaimer}</Text>
        </View>
      </Page>
    </Document>
  );
}
