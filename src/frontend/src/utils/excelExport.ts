export interface ExportRow {
  Name: string;
  RegistrationNumber: string;
  Email: string;
  College: string;
  Score: number;
  SubmissionTime: string;
}

export function exportToExcel(data: ExportRow[], filename: string = 'silicon-teklogic-results') {
  // Convert to CSV format
  const headers = ['Name', 'Registration Number', 'Email', 'College', 'Score', 'Submission Time'];
  const csvRows = [
    headers.join(','),
    ...data.map(row => [
      escapeCSV(row.Name),
      escapeCSV(row.RegistrationNumber),
      escapeCSV(row.Email),
      escapeCSV(row.College),
      row.Score,
      escapeCSV(row.SubmissionTime)
    ].join(','))
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename + '.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
