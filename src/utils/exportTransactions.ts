import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TransactionDto } from '@/services/transactionService';
import { formatCurrency } from './format';

interface ExportRow {
  date: string;
  description: string;
  type: string;
  amount: number;
  tags: string;
}

const buildRows = (
  transactions: TransactionDto[],
  tagsByTransactionId: Record<string, { name: string }[]>,
): ExportRow[] =>
  transactions.map((transaction) => ({
    date: new Date(transaction.date).toLocaleDateString('pt-BR'),
    description: transaction.description,
    type: transaction.entryType === 'credit' ? 'Entrada' : 'Saída',
    amount: transaction.amount,
    tags: (tagsByTransactionId[transaction.id] ?? []).map((tag) => tag.name).join(', '),
  }));

export function exportTransactionsCsv(
  transactions: TransactionDto[],
  tagsByTransactionId: Record<string, { name: string }[]>,
) {
  const rows = buildRows(transactions, tagsByTransactionId);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const csvContent = [
    ['Data', 'Descrição', 'Tipo', 'Valor', 'Tags'].join(';'),
    ...rows.map((row) =>
      [
        row.date,
        escape(row.description),
        row.type,
        row.amount.toFixed(2).replace('.', ','),
        escape(row.tags),
      ].join(';'),
    ),
  ].join('\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `transacoes-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportTransactionsPdf(
  transactions: TransactionDto[],
  tagsByTransactionId: Record<string, { name: string }[]>,
  companyName?: string,
) {
  const rows = buildRows(transactions, tagsByTransactionId);
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Extrato de transações', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const subtitle = [companyName, `Gerado em ${new Date().toLocaleDateString('pt-BR')}`]
    .filter(Boolean)
    .join(' · ');
  doc.text(subtitle, 14, 25);

  const income = rows.filter((r) => r.type === 'Entrada').reduce((sum, r) => sum + r.amount, 0);
  const expense = rows.filter((r) => r.type === 'Saída').reduce((sum, r) => sum + r.amount, 0);

  autoTable(doc, {
    startY: 32,
    head: [['Data', 'Descrição', 'Tipo', 'Valor', 'Tags']],
    body: rows.map((row) => [
      row.date,
      row.description,
      row.type,
      formatCurrency(row.amount),
      row.tags,
    ]),
    headStyles: { fillColor: [39, 185, 105] },
    styles: { fontSize: 9 },
    foot: [
      ['', '', 'Entradas', formatCurrency(income), ''],
      ['', '', 'Saídas', formatCurrency(expense), ''],
      ['', '', 'Saldo', formatCurrency(income - expense), ''],
    ],
    footStyles: { fillColor: [245, 247, 250], textColor: [30, 30, 30], fontStyle: 'bold' },
  });

  doc.save(`transacoes-${new Date().toISOString().split('T')[0]}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
