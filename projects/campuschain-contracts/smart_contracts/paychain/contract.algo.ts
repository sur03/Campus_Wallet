import { Contract } from '@algorandfoundation/algorand-typescript'

export class Paychain extends Contract {
  hello(name: string): string {
    return `Hello, ${name}`
  }
}
