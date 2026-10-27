import { renderSamplePdf } from '../report';

const findElement = <T extends HTMLElement>(id: string, type: new () => T): T => {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`Missing #${id} in spike/pdf.html`);
  }
  return element;
};

const generateButton = findElement('generate', HTMLButtonElement);
const statusOutput = findElement('status', HTMLOutputElement);
const downloadLink = findElement('download', HTMLAnchorElement);

const showPdf = (bytes: Uint8Array<ArrayBuffer>, generationDurationMs: number): void => {
  if (downloadLink.href !== '') {
    URL.revokeObjectURL(downloadLink.href);
  }
  downloadLink.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  downloadLink.hidden = false;
  statusOutput.value = `Generated ${String(bytes.byteLength)} bytes in ${String(generationDurationMs)} ms.`;
  statusOutput.dataset['generationDurationMs'] = String(generationDurationMs);
};

const generatePdf = async (): Promise<void> => {
  generateButton.disabled = true;
  downloadLink.hidden = true;
  delete statusOutput.dataset['generationDurationMs'];
  statusOutput.value = 'Generating…';
  try {
    const startMs = performance.now();
    const bytes = await renderSamplePdf();
    showPdf(bytes, Math.round(performance.now() - startMs));
  } finally {
    generateButton.disabled = false;
  }
};

generateButton.addEventListener('click', () => {
  void generatePdf();
});
