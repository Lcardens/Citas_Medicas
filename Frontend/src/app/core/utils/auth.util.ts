export interface DatosToken {
  id?: string;
  rol?: string;
  exp?: number;
}

function decodificarBase64Url(segmento: string): string {
  let base64 = segmento.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding === 2) base64 += '==';
  else if (padding === 3) base64 += '=';
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
  } catch {
    return atob(base64);
  }
}

export function decodificarToken(token: string | null): DatosToken | null {
  if (!token || token.trim() === '') return null;
  const partes = token.split('.');
  if (partes.length < 2) return null;
  try {
    return JSON.parse(decodificarBase64Url(partes[1])) as DatosToken;
  } catch {
    return null;
  }
}

export function rolDesdeToken(): string {
  const token = localStorage.getItem('token');
  const datos = decodificarToken(token);
  if (!datos || !datos.rol) return '';
  return String(datos.rol).toLowerCase().trim();
}

export function normalizarRol(rol: string): string {
  const limpio = (rol || '').toLowerCase().trim();
  if (limpio === 'usuario') return 'paciente';
  if (limpio === 'administrador') return 'admin';
  return limpio;
}
