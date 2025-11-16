"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Calculator,
  AlertTriangle,
  Shield,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Removed Next.js Head import as we're not using Next.js

interface ValidationResult {
  isValid: boolean
  message: string
  calculatedControlDigit?: number
  providedControlDigit?: number
  errorDetails?: string
}

interface CalculationStep {
  step: number
  digit: number
  beforeAdd: number
  afterAdd: number
  afterMod10: number
  afterMul2: number
  afterMod11: number
}

interface FAQItem {
  question: string
  answer: string
}

export default function OIBGenerator() {
  const [oibInput, setOibInput] = useState("")
  const [generatedOib, setGeneratedOib] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [generatedOibValidation, setGeneratedOibValidation] = useState<ValidationResult | null>(null)
  const { toast } = useToast()
  const [showCalculation, setShowCalculation] = useState(false)
  const [calculationSteps, setCalculationSteps] = useState<CalculationStep[]>([])
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  interface Stats {
    generated: number;
    validated: number;
  }

  const [stats, setStats] = useState<Stats>({ generated: 0, validated: 0 })

  // Load statistics from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem("oib-generator-stats")
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  // Save statistics to localStorage whenever stats change
  useEffect(() => {
    localStorage.setItem("oib-generator-stats", JSON.stringify(stats))
  }, [stats])

  const faqItems: FAQItem[] = [
    {
      question: "Što je OIB i zašto je važan?",
      answer:
        "OIB (Osobni identifikacijski broj) je jedinstveni 11-znamenkasti broj koji služi za identifikaciju fizičkih i pravnih osoba u Republici Hrvatskoj. Koristi se u svim službenim dokumentima i transakcijama.",
    },
    {
      question: "Kako funkcionira ISO 7064 algoritam?",
      answer:
        "ISO 7064 (MOD 11,10) je hibridni sustav koji izračunava kontrolnu znamenku iz prvih 10 znamenaka. Algoritam osigurava visoku razinu provjere valjanosti i otkrivanja grešaka u unosu podataka.",
    },
    {
      question: "Jesu li generirani OIB brojevi sigurni za korištenje?",
      answer:
        "Generirani OIB brojevi su matematički ispravni prema ISO 7064 standardu, ali su namijenjeni ISKLJUČIVO za testiranje aplikacija i validaciju softvera. Ne predstavljaju stvarne osobe.",
    },
    {
      question: "Mogu li koristiti ovaj alat za provjeru stvarnih OIB-ova?",
      answer:
        "Da, alat može provjeriti valjanost bilo kojeg 11-znamenkastog OIB-a prema službenom algoritmu. Međutim, validacija ne potvrđuje da OIB pripada stvarnoj osobi.",
    },
    {
      question: "Što znači kontrolna znamenka?",
      answer:
        "Kontrolna znamenka je zadnja (11.) znamenka OIB-a koja se izračunava iz prvih 10 znamenaka. Služi za provjeru ispravnosti unosa i otkrivanje grešaka.",
    },
    {
      question: "Je li ovaj alat besplatan?",
      answer:
        "Da, alat je potpuno besplatan za korištenje. Namijenjen je programerima, testerima i svima koji trebaju validirati OIB brojeve u svojim aplikacijama.",
    },
  ]

  const networkSites = [
    { name: "BUCO automobili", url: "https://buco.com.hr" },
    { name: "Wikipedia of Influencers", url: "https://wikipediaofinfluencers.com" },
    { name: "Iskustva.com.hr", url: "https://iskustva.com.hr" },
    { name: "Recenzije.com.hr", url: "https://recenzije.com.hr" },
    { name: "Tko me zvao?", url: "https://www.tko-me-zvao.com.hr/" },
    { name: "Links2Pics.com", url: "https://links2pics.com" },
    { name: "RabljenaVozila.eu", url: "https://rabljenavozila.eu" },

  ]

  // Correct OIB validation function
  const isOibValid = (input: string): boolean => {
    const oib = input.toString()

    if (oib.match(/\d{11}/) === null) {
      return false
    }

    let calculated = 10

    for (const digit of oib.substring(0, 10)) {
      calculated += Number.parseInt(digit)
      calculated %= 10

      if (calculated === 0) {
        calculated = 10
      }

      calculated *= 2
      calculated %= 11
    }

    let check = 11 - calculated

    if (check === 10) {
      check = 0
    }

    return check === Number.parseInt(oib[10])
  }

  const validateOIB = (oib: string): ValidationResult => {
    const cleanOib = oib.replace(/\s/g, "")

    if (!cleanOib) {
      return {
        isValid: false,
        message: "OIB ne može biti prazan",
        errorDetails: "Molimo unesite OIB broj",
      }
    }

    if (!/^\d+$/.test(cleanOib)) {
      return {
        isValid: false,
        message: "OIB može sadržavati samo brojeve",
        errorDetails: "Uklonite sve znakove koji nisu brojevi",
      }
    }

    if (cleanOib.length !== 11) {
      return {
        isValid: false,
        message: `OIB mora imati točno 11 znamenaka (uneseno: ${cleanOib.length})`,
        errorDetails: cleanOib.length < 11 ? "Dodajte nedostajuće znamenke" : "Uklonite suvišne znamenke",
      }
    }

    if (/^0+$/.test(cleanOib)) {
      return {
        isValid: false,
        message: "OIB ne može biti samo nule",
        errorDetails: "Unesite valjan OIB broj",
      }
    }

    if (/^(.)\1{10}$/.test(cleanOib)) {
      return {
        isValid: false,
        message: "OIB ne može biti ista znamenka ponovljena 11 puta",
        errorDetails: "Unesite valjan OIB broj",
      }
    }

    const digits = cleanOib.split("").map(Number)
    const providedControlDigit = digits[10]

    let calculated = 10

    for (let i = 0; i < 10; i++) {
      calculated += digits[i]
      calculated %= 10

      if (calculated === 0) {
        calculated = 10
      }

      calculated *= 2
      calculated %= 11
    }

    let calculatedControlDigit = 11 - calculated
    if (calculatedControlDigit === 10) {
      calculatedControlDigit = 0
    }

    if (calculatedControlDigit === providedControlDigit) {
      return {
        isValid: true,
        message: "OIB je valjan",
        calculatedControlDigit,
        providedControlDigit,
      }
    } else {
      return {
        isValid: false,
        message: "OIB nije valjan - kontrolna znamenka ne odgovara",
        calculatedControlDigit,
        providedControlDigit,
        errorDetails: `Kontrolna znamenka trebala bi biti ${calculatedControlDigit}, a unesena je ${providedControlDigit}`,
      }
    }
  }

  const calculateOIBSteps = (oib: string): CalculationStep[] => {
    const cleanOib = oib.replace(/\s/g, "")
    if (cleanOib.length !== 11) return []

    const digits = cleanOib.split("").map(Number)
    const steps: CalculationStep[] = []

    let calculated = 10

    for (let i = 0; i < 10; i++) {
      const beforeAdd = calculated
      calculated += digits[i]
      const afterAdd = calculated

      calculated %= 10
      const afterMod10 = calculated === 0 ? 10 : calculated
      if (calculated === 0) {
        calculated = 10
      }

      calculated *= 2
      const afterMul2 = calculated

      calculated %= 11
      const afterMod11 = calculated

      steps.push({
        step: i + 1,
        digit: digits[i],
        beforeAdd: beforeAdd,
        afterAdd: afterAdd,
        afterMod10: afterMod10,
        afterMul2: afterMul2,
        afterMod11: afterMod11,
      })
    }

    return steps
  }

  const generateOIB = (): string => {
    const firstTenDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10))

    let calculated = 10

    for (let i = 0; i < 10; i++) {
      calculated += firstTenDigits[i]
      calculated %= 10

      if (calculated === 0) {
        calculated = 10
      }

      calculated *= 2
      calculated %= 11
    }

    let controlDigit = 11 - calculated
    if (controlDigit === 10) {
      controlDigit = 0
    }

    return [...firstTenDigits, controlDigit].join("")
  }

  const handleValidate = () => {
    if (!oibInput.trim()) {
      setValidationResult({
        isValid: false,
        message: "Molimo unesite OIB za provjeru",
        errorDetails: "Polje ne može biti prazno",
      })
      return
    }

    const result = validateOIB(oibInput)
    setValidationResult(result)
    updateValidatedCount()

    if (oibInput.replace(/\s/g, "").length === 11) {
      const steps = calculateOIBSteps(oibInput)
      setCalculationSteps(steps)
    }
  }

  const handleGenerate = () => {
    const newOib = generateOIB()
    setGeneratedOib(newOib)

    const validation = validateOIB(newOib)
    setGeneratedOibValidation(validation)

    const isValidCheck = isOibValid(newOib)

    if (!validation.isValid || !isValidCheck) {
      toast({
        title: "Greška u generiranju!",
        description: "Generirani OIB nije valjan. Molimo pokušajte ponovno.",
        variant: "destructive",
      })
    } else {
      updateGeneratedCount()
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Kopirano!",
        description: "OIB je kopiran u međuspremnik",
      })
    } catch (err) {
      toast({
        title: "Greška",
        description: "Nije moguće kopirati OIB",
        variant: "destructive",
      })
    }
  }

  const formatOIB = (oib: string) => {
    return oib.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4")
  }

  const updateGeneratedCount = () => {
    setStats((prev: Stats) => ({ ...prev, generated: prev.generated + 1 }))
  }

  const updateValidatedCount = () => {
    setStats((prev) => ({ ...prev, validated: prev.validated + 1 }))
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("hr-HR").format(num)
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <>
      {/* Head metadata is moved to index.html or managed by your framework's routing */}
        <meta
          name="keywords"
          content="osobni identifikacijski broj, oib, generiraj oib, provjera oiba, OIB generator, hrvatski OIB, OIB validator, ISO 7064, kontrolna znamenka, testiranje aplikacija, Croatia OIB"
        />
        <meta name="author" content="administraktor.com" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Hrvatski OIB Generator - Generiraj i Validiraj OIB Brojeve" />
        <meta
          property="og:description"
          content="Besplatni alat za generiranje i validaciju hrvatskih OIB brojeva prema ISO 7064 standardu."
        />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Hrvatski OIB Generator",
              description: "Alat za generiranje i validaciju hrvatskih OIB brojeva prema ISO 7064 standardu",
              url: "https://administraktor.com/oib-generator",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web Browser",
              author: {
                "@type": "Organization",
                name: "administraktor.com",
              },
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Hrvatski OIB Generator</h1>
              <p className="text-lg text-gray-600">
                Generiraj i validiraj hrvatske OIB brojeve prema ISO 7064 standardu
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Generator Section - Na vrhu */}
          <section className="mb-12">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* OIB Generator */}
              <article>
                <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Generiraj OIB
                    </CardTitle>
                    <CardDescription className="text-green-50">
                      Stvori valjan hrvatski OIB broj za testiranje
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      onClick={handleGenerate}
                      className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Generiraj novi OIB
                    </Button>

                    {generatedOib && (
                      <div className="mt-6 space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-green-600 font-medium mb-2">Generirani OIB:</p>
                              <p className="text-3xl font-mono font-bold text-green-900 tracking-wider mb-1">
                                {formatOIB(generatedOib)}
                              </p>
                              <p className="text-xs text-green-600">Neformatirano: {generatedOib}</p>
                            </div>
                            {generatedOibValidation?.isValid && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generatedOib)}
                                className="bg-white hover:bg-green-50 border-green-300 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {generatedOibValidation?.isValid && (
                          <div className="text-center">
                            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Valjan prema ISO 7064 standardu
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </article>

              {/* OIB Validator */}
              <article>
                <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Validiraj OIB
                    </CardTitle>
                    <CardDescription className="text-blue-50">Provjeri valjanost postojećeg OIB-a</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Input
                          placeholder="Unesite 11-znamenkasti OIB"
                          value={oibInput}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "")
                            if (value.length <= 11) {
                              setOibInput(value)
                              setValidationResult(null)
                              setCalculationSteps([])
                            }
                          }}
                          maxLength={11}
                          className="h-14 text-lg font-mono tracking-wider"
                        />
                        <div className="flex justify-between items-center text-sm mt-2">
                          <span className="text-gray-500">{oibInput.length}/11 znamenaka</span>
                          {oibInput.length > 0 && (
                            <span className="text-gray-400 font-mono">{formatOIB(oibInput.padEnd(11, "·"))}</span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={handleValidate}
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200"
                        disabled={!oibInput.trim()}
                      >
                        <Calculator className="h-5 w-5 mr-2" />
                        Provjeri OIB
                      </Button>

                      {validationResult && (
                        <div
                          className={`p-6 rounded-xl border-2 ${
                            validationResult.isValid
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {validationResult.isValid ? (
                              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <span
                                className={`font-semibold text-lg ${
                                  validationResult.isValid ? "text-green-800" : "text-red-800"
                                }`}
                              >
                                {validationResult.message}
                              </span>
                              {validationResult.errorDetails && (
                                <p
                                  className={`mt-2 text-sm ${
                                    validationResult.isValid ? "text-green-700" : "text-red-700"
                                  }`}
                                >
                                  {validationResult.errorDetails}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {validationResult && oibInput.replace(/\s/g, "").length === 11 && (
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowCalculation(!showCalculation)}
                            className="w-full"
                          >
                            {showCalculation ? "Sakrij" : "Prikaži"} detaljni izračun
                          </Button>

                          {showCalculation && calculationSteps.length > 0 && (
                            <div className="bg-white border rounded-lg p-4 overflow-x-auto">
                              <h4 className="font-semibold mb-3">Korak-po-korak izračun:</h4>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left p-2">Korak</th>
                                    <th className="text-left p-2">Znamenka</th>
                                    <th className="text-left p-2">+</th>
                                    <th className="text-left p-2">%10</th>
                                    <th className="text-left p-2">×2</th>
                                    <th className="text-left p-2">%11</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {calculationSteps.map((step, index) => (
                                    <tr key={index} className="border-b">
                                      <td className="p-2 font-mono">{step.step}</td>
                                      <td className="p-2 font-mono font-bold">{step.digit}</td>
                                      <td className="p-2 font-mono">{step.afterAdd}</td>
                                      <td className="p-2 font-mono">{step.afterMod10}</td>
                                      <td className="p-2 font-mono">{step.afterMul2}</td>
                                      <td className="p-2 font-mono font-bold">{step.afterMod11}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOibInput("69435151530")
                            setValidationResult(null)
                            setCalculationSteps([])
                          }}
                          className="w-full"
                        >
                          Testiraj s primjerom: 69435151530
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </article>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-800">
                  <BarChart3 className="h-5 w-5" />
                  Statistike korištenja
                </CardTitle>
                <CardDescription className="text-indigo-600">
                  Ukupan broj generiranih i validiranih OIB brojeva
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-green-500 rounded-full p-3">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-800 mb-2 font-mono">
                      {formatNumber(stats.generated)}
                    </div>
                    <div className="text-sm font-medium text-green-700">Generirani OIB brojevi</div>
                    <div className="text-xs text-green-600 mt-1">Ukupno od početka korištenja</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-blue-500 rounded-full p-3">
                        <Calculator className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-800 mb-2 font-mono">
                      {formatNumber(stats.validated)}
                    </div>
                    <div className="text-sm font-medium text-blue-700">Validirani OIB brojevi</div>
                    <div className="text-xs text-blue-600 mt-1">Ukupno provjera valjanosti</div>
                  </div>
                </div>

                <div className="mt-6 bg-white/60 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Generiranje</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Validacija</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">* Statistike se čuvaju lokalno u vašem pregledniku</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <HelpCircle className="h-5 w-5" />
                  Često postavljana pitanja (FAQ)
                </CardTitle>
                <CardDescription>Odgovori na najčešća pitanja o OIB generatoru i validatoru</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{item.question}</span>
                        {openFAQ === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {openFAQ === index && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Disclaimer Section - Ispod generatora */}
          <section className="mb-8">
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Važno upozorenje i odricanje od odgovornosti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <h4 className="font-bold text-red-800 mb-2">⚠️ PRAVNA NAPOMENA</h4>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Generirani OIB brojevi namijenjeni su ISKLJUČIVO za validaciju softvera, testiranje aplikacija i
                    provjeru usklađenosti sa standardom. Ovi brojevi su matematički ispravni, ali NE predstavljaju
                    stvarne osobe ili pravne subjekte.
                  </p>
                </div>

                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">🚫 ZABRANJENE UPORABE</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Krađa identiteta ili lažno predstavljanje</li>
                    <li>• Prijevarne aktivnosti ili krivotvorenje dokumenata</li>
                    <li>• Neovlašteni pristup sustavima ili uslugama</li>
                    <li>• Bilo koje nezakonite ili zlonamjerne svrhe</li>
                  </ul>
                </div>

                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">✅ DOPUŠTENE UPORABE</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Testiranje validacije OIB-a u aplikacijama</li>
                    <li>• Provjera algoritma kontrolne znamenke</li>
                    <li>• Edukacijske svrhe i učenje</li>
                    <li>• Razvoj i testiranje softvera</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-600 text-center pt-4 border-t">
                  Korištenjem ovog alata prihvaćate da ćete ga koristiti odgovorno i u skladu sa zakonom.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Algorithm Info */}
          <section>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Shield className="h-5 w-5" />O algoritmu ISO 7064
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    OIB (Osobni identifikacijski broj) koristi ISO 7064 (MOD 11,10) algoritam za izračun kontrolne
                    znamenke. Ovaj hibridni sustav osigurava visoku razinu provjere valjanosti i otkrivanja grešaka u
                    unosu podataka.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white/95 backdrop-blur-sm border-t mt-16">
          <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Administraktor.com Network Section */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                    Administraktor.com
                  </span>{" "}
                  <span className="text-gray-900">Network</span>
                </h3>
                <p className="text-gray-600">Profesionalne web usluge i digitalna rješenja</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {networkSites.map((site, index) => (
                  <a
                    key={index}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {site.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-600 ml-auto" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                © 2024{" "}
                <a
                  href="https://administraktor.com"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  administraktor.com
                </a>{" "}
                | Alat za testiranje i edukaciju
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
