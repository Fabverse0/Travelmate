import { GoogleGenerativeAI } from '@google/generative-ai'
import { itinerarySchema } from './schema'
import { TravelerType, LanguageStyle } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const gemini = {
  // Model configuration (Using verified gemini-flash-latest)
  model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
  temperature: 0.8,
  maxOutputTokens: 2048,

  // Generate chat response
  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemInstruction: string
  ): Promise<string> {
    const model = genAI.getGenerativeModel({ 
      model: this.model,
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens,
      },
      systemInstruction,
    })

    // Separate previous turns for history and last turn for sendMessage
    const previousMessages = messages.slice(0, -1)
    const lastMessage = messages[messages.length - 1]

    const formattedHistory = previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const chat = model.startChat({
      history: formattedHistory,
    })

    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    return response.text()
  },

  // Generate itinerary dengan structured output
  async generateItinerary(
    context: string,
    systemInstruction: string
  ): Promise<any> {
    const model = genAI.getGenerativeModel({ 
      model: this.model,
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens,
      },
      systemInstruction,
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: context }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema as any,
      },
    })

    const response = await result.response
    const text = response.text()
    
    try {
      return JSON.parse(text)
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      console.error('Raw response:', text)
      throw new Error('Failed to generate itinerary')
    }
  },

  // Check if user has provided enough information untuk generate itinerary
  async checkIfReadyForItinerary(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemInstruction: string
  ): Promise<boolean> {
    const model = genAI.getGenerativeModel({ 
      model: this.model,
      generationConfig: {
        temperature: 0.2, // Lower temperature untuk decision making yang tepat
        maxOutputTokens: 20,
      },
      systemInstruction: `${systemInstruction}\n\nTugas Evaluasi: Jawab HANYA dengan kata "YES" atau "NO". Jawab "YES" jika dan hanya jika pengguna sudah secara eksplisit memberikan 3 informasi utama: (1) destinasi perjalanan, (2) durasi/jumlah hari, dan (3) budget/biaya. Jawab "NO" jika salah satu dari 3 informasi tersebut belum ada.`,
    })

    const previousMessages = conversationHistory.slice(0, -1)
    const lastMessage = conversationHistory[conversationHistory.length - 1]

    const formattedHistory = previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const chat = model.startChat({
      history: formattedHistory,
    })

    const result = await chat.sendMessage(`Pesan terbaru dari user: "${lastMessage.content}". Apakah informasi destinasi, durasi, dan budget sudah LENGKAP? Jawab YES atau NO saja.`)
    const response = await result.response
    const answer = response.text().trim().toUpperCase()
    
    return answer.includes('YES')
  }
}