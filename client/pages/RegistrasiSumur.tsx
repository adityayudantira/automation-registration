import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  ArrowLeft,
  MapPin,
  FileText,
  RefreshCw,
  Edit,
  Database
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RegistrasiSumur() {
  const [useManualInput, setUseManualInput] = useState(false);
  const [provinsiList, setProvinsiList] = useState([]);
  const [kabupatenList, setKabupatenList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [desaList, setDesaList] = useState([]);

  const [selected, setSelected] = useState({
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    desa: "",
    kodeJenis: "",
    kodeWilayah: ""
  });

  //suggestion
  const [inputManual, setInputManual] = useState({
  provinsi: "",
  kabupaten: "",
  kecamatan: "",
  desa: ""
  });

  const [suggestions, setSuggestions] = useState({
    provinsi: [] as string[],
    kabupaten: [] as string[],
    kecamatan: [] as string[],
    desa: [] as string[]
  });

  const [loading, setLoading] = useState(false);
  const [regSumur, setRegSumur] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const res = await fetch(`${apiUrl}/wilayah/provinsi`);
        const data = await res.json();
        setProvinsiList(data);
      } catch (err) {
        console.error("Error fetching provinsi:", err);
        setError("Gagal mengambil data provinsi");
      }
    };
    fetchProvinsi();
  }, []);

  useEffect(() => {
    const fetchKabupaten = async () => {
      if (selected.provinsi && !useManualInput) {
        try {
          const res = await fetch(`${apiUrl}/wilayah/kabupaten/${selected.provinsi}`);
          const data = await res.json();
          setKabupatenList(data);
        } catch (err) {
          console.error("Error fetching kabupaten:", err);
          setKabupatenList([]);
        }
      }
    };
    fetchKabupaten();
    setSelected(prev => ({ ...prev, kabupaten: "", kecamatan: "", desa: "", kodeWilayah: "" }));
    setKecamatanList([]);
    setDesaList([]);
  }, [selected.provinsi, useManualInput]);

  useEffect(() => {
    const fetchKecamatan = async () => {
      if (selected.kabupaten && !useManualInput) {
        try {
          const res = await fetch(`${apiUrl}/wilayah/kecamatan/${selected.kabupaten}`);
          const data = await res.json();
          setKecamatanList(data);
        } catch (err) {
          console.error("Error fetching kecamatan:", err);
          setKecamatanList([]);
        }
      }
    };
    fetchKecamatan();
    setSelected(prev => ({ ...prev, kecamatan: "", desa: "", kodeWilayah: "" }));
    setDesaList([]);
  }, [selected.kabupaten, useManualInput]);

  useEffect(() => {
    const fetchDesa = async () => {
      if (selected.kecamatan && !useManualInput) {
        try {
          const res = await fetch(`${apiUrl}/wilayah/kelurahan/${selected.kecamatan}`);
          const data = await res.json();
          setDesaList(data);
        } catch (err) {
          console.error("Error fetching desa:", err);
          setDesaList([]);
        }
      }
    };
    fetchDesa();
    setSelected(prev => ({ ...prev, desa: "", kodeWilayah: "" }));
  }, [selected.kecamatan, useManualInput]);

  useEffect(() => {
    const desaData = desaList.find(d => d.nama === selected.desa);
    if (desaData) {
      setSelected(prev => ({ ...prev, kodeWilayah: desaData.kode }));
    }
  }, [selected.desa]);

  const handleChange = (e) => {
    setSelected({ ...selected, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegSumur("");
    setError("");

    if (
      useManualInput &&
      (!selected.provinsi || !selected.kabupaten || !selected.kecamatan || !selected.desa || selected.kodeJenis === "")
    ) {
      setError("Mohon lengkapi data wilayah dan jenis sumur.");
      setLoading(false);
      return;
    }

    if (!useManualInput && (!selected.kodeWilayah || selected.kodeJenis === "")) {
      setError("Mohon lengkapi data wilayah dan jenis sumur.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = useManualInput ? "/registrasi/nama-fuzzy" : "/registrasi";

      const payload = useManualInput
        ? {
            provinsi: selected.provinsi,
            kabupaten: selected.kabupaten,
            kecamatan: selected.kecamatan,
            desa: selected.desa,
            jenis: parseInt(selected.kodeJenis)
          }
        : {
            kodeWilayah: selected.kodeWilayah,
            jenis: selected.kodeJenis,
            dataLain: {
              provinsi: selected.provinsi,
              kabupaten: selected.kabupaten,
              kecamatan: selected.kecamatan,
              desa: selected.desa
            }
          };

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      if (data.nomorRegistrasi) {
        setRegSumur(
          `✅ ${data.nomorRegistrasi} (${data.wilayah?.desa}, ${data.wilayah?.kecamatan}, ${data.wilayah?.kabupaten}, ${data.wilayah?.provinsi})`
        );
      } else {
        setError("Registrasi berhasil tapi nomor tidak ditemukan.");
      }

    } catch (err) {
      console.error("Error submitting registration:", err);
      setError(err.message || "Terjadi kesalahan saat mengirim data.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInputMode = () => {
    setUseManualInput(!useManualInput);
    setSelected({
      provinsi: "",
      kabupaten: "",
      kecamatan: "",
      desa: "",
      kodeJenis: "",
      kodeWilayah: ""
    });
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);
    setRegSumur("");
    setError("");
  };

    //suggestion
    const fetchSuggestions = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/registrasi/saran-wilayah", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inputManual)
    });

    const data = await res.json();
    setSuggestions(data.saran || {});
  } catch (err) {
    console.error("Gagal ambil saran wilayah:", err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Tim Air Tanah</span>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <FileText className="h-3 w-3 mr-1" />
              Registrasi Sumur Berbasis Wilayah
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Registrasi Sumur</h1>
            <p className="text-xl text-muted-foreground">
              Sistem registrasi otomatis berdasarkan kode wilayah atau input manual (fuzzy)
            </p>
            {error && (
              <Badge variant="destructive" className="mt-2">{error}</Badge>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Form Registrasi Sumur
              </CardTitle>
              <CardDescription>
                Pilih metode input data wilayah dan lengkapi informasi sumur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Button type="button" variant="outline" onClick={toggleInputMode} className="gap-2">
                  {useManualInput ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Gunakan Dropdown
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Gunakan Input Manual
                    </>
                  )}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Data Wilayah
                  </h3>

                  {useManualInput ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {["provinsi", "kabupaten", "kecamatan", "desa"].map((field) => {
                        // Mapping placeholder
                        const placeholders = {
                          provinsi: "Masukkan Nama Provinsi",
                          kabupaten: "Masukkan Nama Kabupaten/Kota",
                          kecamatan: "Masukkan Nama Kecamatan",
                          desa: "Masukkan Nama Desa/Kelurahan"
                        };

                        return (
                          <div key={field}>
                            <label className="block text-sm font-medium mb-2 capitalize">
                              {field} <span className="text-red-500">*</span>
                            </label>
                            <input
                              name={field}
                              placeholder={placeholders[field] || `Masukkan ${field}`}
                              value={selected[field]}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-input rounded-md bg-background placeholder-gray-400"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Provinsi</label>
                        <select name="provinsi" value={selected.provinsi} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md">
                          <option value="">-- Pilih Provinsi --</option>
                          {provinsiList.map((p) => (
                            <option key={p.kode} value={p.kode}>{p.nama}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kabupaten/Kota</label>
                        <select name="kabupaten" value={selected.kabupaten} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md">
                          <option value="">-- Pilih Kabupaten/Kota --</option>
                          {kabupatenList.map((k) => (
                            <option key={k.kode} value={k.kode}>{k.nama}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kecamatan</label>
                        <select name="kecamatan" value={selected.kecamatan} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md">
                          <option value="">-- Pilih Kecamatan --</option>
                          {kecamatanList.map((k) => (
                            <option key={k.kode} value={k.kode}>{k.nama}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Desa/Kelurahan</label>
                        <select name="desa" value={selected.desa} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md">
                          <option value="">-- Pilih Desa/Kelurahan --</option>
                          {desaList.map((d) => (
                            <option key={d.kode} value={d.nama}>{d.nama}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Droplets className="h-4 w-4 inline mr-1" />
                    Kode Jenis Sumur
                  </label>
                  <select
                    name="kodeJenis"
                    value={selected.kodeJenis}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Pilih jenis sumur</option>
                    <option value="0">0 - Sumur Produksi</option>
                    <option value="1">1 - Sumur Pantau</option>
                    <option value="2">2 - Sumur Penggunaan</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button type="submit" disabled={loading} size="lg" className="flex-1">
                    <Droplets className="h-5 w-5 mr-2" />
                    {loading ? "Mendaftarkan..." : "Daftarkan Sumur"}
                  </Button>
                  <Link to="/" className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>

              {regSumur && (
                <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="font-semibold mb-2 text-green-800">Hasil Registrasi:</h3>
                  <p className="text-lg text-green-700">{regSumur}</p>
                </div>
              )}

              {error && !regSumur && (
                <div className="mt-6 p-4 border rounded-lg bg-red-50 border-red-200">
                  <h3 className="font-semibold mb-2 text-red-800">Error:</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
