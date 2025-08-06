import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Link } from "react-router-dom";
import { Droplets, MapPin, Search, FileText, BarChart3, Settings, ChevronRight, Shield, Clock, Database, CheckCircle, ArrowRight } from "lucide-react";

export default function Index() {

  const features = [
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Pendaftaran Digital",
      description: "Sistem pendaftaran sumur digital yang efisien dan terintegrasi dengan baik"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Pengelolaan Lokasi",
      description: "Pengelolaan data lokasi dengan koordinat berketelitian tinggi"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Kepatuhan Peraturan",
      description: "Memastikan kepatuhan terhadap standar dan peraturan yang berlaku"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Basis Data Terpusat",
      description: "Penyimpanan data sumur yang aman dan mudah diakses"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Water Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="water-wave water-wave-1"></div>
        <div className="water-wave water-wave-2"></div>
        <div className="water-wave water-wave-3"></div>
        <div className="water-bubble water-bubble-1"></div>
        <div className="water-bubble water-bubble-2"></div>
        <div className="water-bubble water-bubble-3"></div>
        <div className="water-bubble water-bubble-4"></div>
        <div className="water-bubble water-bubble-5"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg shadow-sm border border-gray-100"
                style={{
                  backgroundColor: "rgba(248, 248, 248, 1)",
                  backgroundImage: "url(https://cdn.builder.io/api/v1/image/assets%2Fb19247a899d64be18bd48c601ef0aace%2F367235eba4074ff493765df1239f9f87)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tim Air Tanah</h1>
                <p className="text-xs text-gray-500">Sistem Pendaftaran Sumur</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/data-sumur" className="text-gray-600 hover:text-gray-900 transition-colors">
                Data Sumur
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/registrasi-sumur">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Registrasi
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-green-100"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-50/30 to-transparent"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 text-blue-700 shadow-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Platform Resmi Pemerintah
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-8 leading-tight">
              Pendaftaran Sumur
              <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 bg-clip-text text-transparent"
                    style={{animation: 'float 3s ease-in-out infinite'}}>Air Tanah</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Platform modern berbasis web untuk pendaftaran dan pengelolaan sumur air tanah
              yang mudah, aman, dan sesuai dengan standar pemerintah.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/registrasi-sumur">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 hover:from-blue-700 hover:via-blue-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Droplets className="h-5 w-5 mr-3" />
                  Mulai Pendaftaran
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 transition-all duration-300">
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Lihat Dasbor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 via-blue-50/30 to-green-50/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-6">
              Solusi Lengkap Pengelolaan Sumur
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform web canggih yang menyediakan layanan pendaftaran, pemantauan, dan
              pengelolaan data sumur air tanah secara menyeluruh.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 border-0 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:via-blue-100/50 hover:to-green-100/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-600 transition-all duration-300 shadow-sm">
                    <div className="text-blue-600 group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-white via-blue-50/50 to-green-50/50">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-6">
            Mulai Pendaftaran Sumur Anda
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Proses pendaftaran yang mudah, cepat, dan sesuai dengan standar peraturan pemerintah.
            Dapatkan nomor pendaftaran resmi untuk sumur air tanah Anda.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/registrasi-sumur">
              <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 hover:from-blue-700 hover:via-blue-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <Droplets className="h-5 w-5 mr-3" />
                Daftar Sekarang
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 transition-all duration-300">
                <BarChart3 className="h-5 w-5 mr-3" />
                Lihat Dasbor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 rounded-lg shadow-lg"
                  style={{
                    backgroundColor: "rgba(248, 248, 248, 1)",
                    backgroundImage: "url(https://cdn.builder.io/api/v1/image/assets%2Fb19247a899d64be18bd48c601ef0aace%2F367235eba4074ff493765df1239f9f87)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                  }}
                />
                <span className="text-xl font-bold">Tim Air Tanah</span>
              </div>
              <p className="text-gray-300 text-lg max-w-md">
                Platform web resmi untuk pendaftaran dan pengelolaan sumur air tanah
                yang terhubung dengan sistem pemerintah.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Layanan</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/registrasi-sumur" className="hover:text-white transition-colors">Pendaftaran Sumur</Link></li>
                <li><Link to="/data-sumur" className="hover:text-white transition-colors">Data Sumur</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dasbor</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Bantuan</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Panduan</li>
                <li className="hover:text-white transition-colors cursor-pointer">Kontak</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700/50 mt-12 pt-8 text-center text-gray-300">
            <p>© 2024 Tim Air Tanah. Semua hak dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}