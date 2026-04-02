export type SignatureResponse = {
  cloudName: string
  apiKey: string
  folder: string
  timestamp: number
  signature: string
}

export async function getSignature(functionsBaseUrl: string, folder?: string): Promise<SignatureResponse> {
  const res = await fetch(`${functionsBaseUrl}/getSignature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  })
  if (!res.ok) throw new Error(`Signature request failed: ${res.status}`)
  return res.json()
}

export async function uploadToCloudinary(file: File, sig: SignatureResponse): Promise<{ public_id: string, secure_url: string }> {
  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', String(sig.timestamp))
  form.append('signature', sig.signature)
  form.append('folder', sig.folder)

  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`)
  return res.json()
}
