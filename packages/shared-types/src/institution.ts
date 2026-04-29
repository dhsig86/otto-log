export interface Institution {
  id: string
  name: string
  shortName: string
  city: string
  state: string
  country: string
  isResidencyProgram: boolean
  cnpj?: string
  createdAt: Date
}
