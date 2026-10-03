import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import type { GeneratedReport } from '../services/reportApi'

const escapeCsvValue = (value: unknown) => {
  const stringValue = String(value ?? '')

  return `"${stringValue.replace(/"/g, '""')}"`
}

export const downloadReportCsv = (
  report: GeneratedReport,
) => {
  const rows: string[][] = []

  rows.push([
    'Report Range',
    `${report.range} days`,
  ])

  rows.push([
    'Generated At',
    new Date(report.generatedAt).toLocaleString(),
  ])

  rows.push([])

  rows.push(['REPORT SUMMARY'])

  rows.push([
    'Total Users',
    String(report.summary.totalUsers),
  ])

  rows.push([
    'Total Transactions',
    String(report.summary.totalTransactions),
  ])

  rows.push([
    'Completed Transactions',
    String(report.summary.completedTransactions),
  ])

  rows.push([
    'Pending Transactions',
    String(report.summary.pendingTransactions),
  ])

  rows.push([
    'Failed Transactions',
    String(report.summary.failedTransactions),
  ])

  rows.push([
    'Total Revenue',
    report.summary.totalRevenue.toFixed(2),
  ])

  rows.push([
    'Average Transaction Value',
    report.summary.averageTransactionValue.toFixed(2),
  ])

  rows.push([])

  rows.push(['TRANSACTIONS'])

  rows.push([
    'Transaction ID',
    'Customer',
    'Amount',
    'Status',
    'Payment Method',
    'Date',
  ])

  report.transactions.forEach(
    (transaction) => {
      rows.push([
        transaction.transactionId,
        transaction.customer,
        transaction.amount.toFixed(2),
        transaction.status,
        transaction.paymentMethod,
        new Date(
          transaction.date,
        ).toLocaleString(),
      ])
    },
  )

  rows.push([])

  rows.push(['USERS'])

  rows.push([
    'Name',
    'Email',
    'Role',
    'Status',
    'Joined Date',
  ])

  report.users.forEach((user) => {
    rows.push([
      user.name,
      user.email,
      user.role,
      user.status,
      new Date(
        user.joinedDate,
      ).toLocaleDateString(),
    ])
  })

  const csvContent = rows
    .map((row) =>
      row
        .map(escapeCsvValue)
        .join(','),
    )
    .join('\n')

  const blob = new Blob(
    [csvContent],
    {
      type: 'text/csv;charset=utf-8;',
    },
  )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url

  link.download =
    `analytics-report-${report.range}-days.csv`

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export const downloadReportPdf = (
  report: GeneratedReport,
) => {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(
    'Analytics Business Report',
    14,
    20,
  )

  doc.setFontSize(10)
  doc.text(
    `Report Period: Last ${report.range} days`,
    14,
    28,
  )

  doc.text(
    `Generated: ${new Date(
      report.generatedAt,
    ).toLocaleString()}`,
    14,
    34,
  )

  // Summary
  doc.setFontSize(14)
  doc.text(
    'Report Summary',
    14,
    46,
  )

  autoTable(doc, {
    startY: 51,
    head: [['Metric', 'Value']],
    body: [
      [
        'Total Users',
        String(report.summary.totalUsers),
      ],
      [
        'Total Transactions',
        String(
          report.summary.totalTransactions,
        ),
      ],
      [
        'Completed Transactions',
        String(
          report.summary.completedTransactions,
        ),
      ],
      [
        'Pending Transactions',
        String(
          report.summary.pendingTransactions,
        ),
      ],
      [
        'Failed Transactions',
        String(
          report.summary.failedTransactions,
        ),
      ],
      [
        'Total Revenue',
        `$${report.summary.totalRevenue.toFixed(2)}`,
      ],
      [
        'Average Transaction',
        `$${report.summary.averageTransactionValue.toFixed(2)}`,
      ],
    ],
  })

  // Transactions
  doc.addPage()

  doc.setFontSize(14)
  doc.text(
    'Transactions',
    14,
    20,
  )

  autoTable(doc, {
    startY: 25,
    head: [[
      'Transaction ID',
      'Customer',
      'Amount',
      'Status',
      'Payment',
    ]],
    body: report.transactions.map(
      (transaction) => [
        transaction.transactionId,
        transaction.customer,
        `$${transaction.amount.toFixed(2)}`,
        transaction.status,
        transaction.paymentMethod,
      ],
    ),
    styles: {
      fontSize: 8,
    },
  })

  // Users
  doc.addPage()

  doc.setFontSize(14)
  doc.text(
    'Users',
    14,
    20,
  )

  autoTable(doc, {
    startY: 25,
    head: [[
      'Name',
      'Email',
      'Role',
      'Status',
    ]],
    body: report.users.map(
      (user) => [
        user.name,
        user.email,
        user.role,
        user.status,
      ],
    ),
    styles: {
      fontSize: 8,
    },
  })

  doc.save(
    `analytics-report-${report.range}-days.pdf`,
  )
}