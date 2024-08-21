import { AnswersExportFormats, loadQuery } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';
import writeExcel from 'write-excel-file';

const SUPPORTED_EXTENSIONS = ['csv', 'tsv', 'xlsx'] as const;

type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

const EXTENSIONS_TO_MEDIA_TYPES: Record<SupportedExtension, string> = {
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export async function GET({ fetch, cookies, params }) {
  if (!SUPPORTED_EXTENSIONS.includes(params.extension as SupportedExtension))
    error(404, { message: 'Format non supporté' });

  const extension: SupportedExtension = params.extension as SupportedExtension;

  let answersExport: string;
  let title: string;

  try {
    const { form } = await loadQuery(
      {
        form: [
          { localId: params.form },
          {
            title: true,
            answersExport: [
              {
                format: extension === 'csv' ? AnswersExportFormats.CSV : AnswersExportFormats.TSV,
              },
              true,
            ],
          },
        ],
      },
      { fetch, token: cookies.get('token') },
    );

    if (form === undefined) error(500, { message: "Impossible d'exporter" });

    ({ title, answersExport } = form);
  } catch (error_) {
    error(500, { message: `Impossible d'exporter en ${error_?.toString() ?? ''}` });
  }

  let blob: Blob | string;
  if (extension === 'xlsx') {
    const cells = answersExport.split('\n').map((row) => row.split('\t'));
    const [header, ...data] = cells;
    blob = await writeExcel(
      [
        header.map((cell) => ({ value: cell, type: String, fontWeight: 'bold' })),
        ...data.map((row) => row.map((cell) => ({ value: cell, type: String }))),
      ],
      {},
    );
  } else {
    blob = answersExport;
  }

  return new Response(blob, {
    headers: {
      'Content-Type': EXTENSIONS_TO_MEDIA_TYPES[extension],
      'Content-Disposition': `attachment; filename="Réponses au formulaire ${title} au ${new Date().toISOString()}.${params.extension}"`,
    },
  });
}
