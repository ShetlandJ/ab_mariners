<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-medium dark:text-white">RN Career</h3>
      <div v-if="rows.length" class="flex space-x-2">
        <button
          @click="printTable"
          class="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded"
          title="Print this career table"
        >
          Print
        </button>
        <button
          @click="exportToExcel"
          class="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          title="Export this career table to Excel"
        >
          Export to Excel
        </button>
      </div>
    </div>

    <div v-if="!rows.length" class="text-gray-500 dark:text-gray-400 italic">
      No career records.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-sm border border-gray-200 dark:border-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Ship</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Rank</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Start date</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">End date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(row, i) in rows" :key="i" class="bg-white dark:bg-gray-800">
            <td class="px-3 py-2 text-gray-900 dark:text-white">{{ row.ship }}</td>
            <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ row.rank || '—' }}</td>
            <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ formatDate(row.start) || '—' }}</td>
            <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ formatDate(row.end) || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { formatDate } from '../lib/formatDate';

export default {
  name: 'CareerTable',
  props: {
    // [{ ship, rank, start, end }], pre-sorted chronologically
    rows: {
      type: Array,
      default: () => []
    },
    // Used to title the printout / spreadsheet
    title: {
      type: String,
      default: 'RN Career'
    }
  },
  setup(props) {
    function displayRows() {
      return props.rows.map(r => ({
        Ship: r.ship,
        Rank: r.rank || '',
        'Start date': formatDate(r.start),
        'End date': formatDate(r.end)
      }));
    }

    function exportToExcel() {
      const worksheet = XLSX.utils.json_to_sheet(displayRows());
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Career');
      const safeName = props.title.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'career';
      XLSX.writeFile(workbook, `${safeName}.xlsx`);
    }

    function printTable() {
      const escape = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const bodyRows = displayRows().map(r => `
        <tr>
          <td>${escape(r.Ship)}</td>
          <td>${escape(r.Rank)}</td>
          <td>${escape(r['Start date'])}</td>
          <td>${escape(r['End date'])}</td>
        </tr>`).join('');

      const html = `<!doctype html><html><head><meta charset="utf-8">
        <title>${escape(props.title)}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 18px; margin: 0 0 16px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #999; padding: 6px 10px; text-align: left; font-size: 13px; }
          th { background: #eee; }
        </style></head><body>
        <h1>${escape(props.title)}</h1>
        <table><thead><tr><th>Ship</th><th>Rank</th><th>Start date</th><th>End date</th></tr></thead>
        <tbody>${bodyRows}</tbody></table>
        </body></html>`;

      // Print just the career table via a hidden iframe so the app chrome
      // (sidebar, buttons, other cards) is not included in the printout.
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }

    return { formatDate, exportToExcel, printTable };
  }
};
</script>
