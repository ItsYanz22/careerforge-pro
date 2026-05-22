import { API_BASE_URL } from '@config';

export interface ExportPDFRequest {
  resumeId?: string;
  resumeData?: any;
  template?: string;
  font?: string;
  theme?: string;
  spacing?: any;
  fileName?: string;
}

/**
 * Export API client — uses native fetch to handle binary (Blob) responses.
 * The generic apiClient returns JSON; PDF endpoints return binary buffers.
 */
export const exportApi = {
  /**
   * Export resume as PDF — returns a Blob for browser download.
   * Free users get a basic PDF; Pro users get watermark-free export.
   */
  exportPDF: async (resumeIdOrRequest: string | ExportPDFRequest, _options?: { watermark?: boolean }): Promise<Blob> => {
    const token = localStorage.getItem('token');
    const body: ExportPDFRequest =
      typeof resumeIdOrRequest === 'string'
        ? { resumeId: resumeIdOrRequest }
        : resumeIdOrRequest;

    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to parse error JSON
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // ignore
      }
      const err: any = new Error(errorData.error ?? `Export failed (${response.status})`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.blob();
  },

  /**
   * Export resume as base64 PDF string — useful for mobile / SPA.
   */
  exportPDFBase64: async (
    request: ExportPDFRequest
  ): Promise<{ pdf: string; mimeType: string; fileName: string }> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/export/pdf-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });

    const json = await response.json();

    if (!response.ok) {
      const err: any = new Error(json.error ?? 'Export failed');
      err.status = response.status;
      err.data = json;
      throw err;
    }

    return json.data;
  },

  /**
   * Export resume as DOCX — returns a Blob for browser download.
   */
  exportDOCX: async (resumeId: string): Promise<Blob> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/export/docx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ resumeId }),
    });

    if (!response.ok) {
      let errorData: any = {};
      try { errorData = await response.json(); } catch {}
      const err: any = new Error(errorData.error ?? `Export failed (${response.status})`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.blob();
  },

  /**
   * Trigger a browser download from a Blob.
   */
  downloadBlob: (blob: Blob, fileName: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
