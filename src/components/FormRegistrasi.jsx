import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Droplets, MapPin, User, FileText, RefreshCw, Edit, Database } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FormRegistrasi() {
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
    kodeJenis: ""
  });
  const [loading, setLoading] = useState(false);
  const [regSumur, setRegSumur] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/wilayah/provinsi`)
      .then(res => res.json())
      .then(setProvinsiList)
      .catch(err => {
        console.error("Error fetching provinsi:", err);
        setError("Gagal mengambil data provinsi. Pastikan backend berjalan.");
      });
  }, []);

  useEffect(() => {
    if (selected.provinsi && !useManualInput) {
      fetch(`${apiUrl}/wilayah/kabupaten?provinsi=${encodeURIComponent(selected.provinsi)}`)
        .then(res => res.json())
        .then(setKabupatenList)
        .catch(err => console.error("Error fetching kabupaten:", err));
    } else {
      setKabupatenList([]);
    }
    setSelected(prev => ({ ...prev, kabupaten: "", kecamatan: "", desa: "" }));
    setKecamatanList([]);
    setDesaList([]);
  }, [selected.provinsi, useManualInput]);

  useEffect(() => {
    if (selected.kabupaten && !useManualInput) {
      fetch(`${apiUrl}/wilayah/kecamatan?kabupaten=${encodeURIComponent(selected.kabupaten)}`)
        .then(res => res.json())
        .then(setKecamatanList)
        .catch(err => console.error("Error fetching kecamatan:", err));
    } else {
      setKecamatanList([]);
    }
    setSelected(prev => ({ ...prev, kecamatan: "", desa: "" }));
    setDesaList([]);
  }, [selected.kabupaten, useManualInput]);

  useEffect(() => {
    if (selected.kecamatan && !useManualInput) {
      fetch(`${apiUrl}/wilayah/desa?kecamatan=${encodeURIComponent(selected.kecamatan)}`)
        .then(res => res.json())
        .then(setDesaList)
        .catch(err => console.error("Error fetching desa:", err));
    } else {
      setDesaList([]);
    }
    setSelected(prev => ({ ...prev, desa: "" }));
  }, [selected.kecamatan, useManualInput]);

  const handleChange = (e) => {
    setSelected({ ...selected, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegSumur("");
    setError("");

    try {
      const endpoint = "/registrasi/nama-fuzzy";
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected)
      });

      const data = await res.json();
      
      if (data.reg_sumur) {
        setRegSumur(
          `✅ ${data.reg_sumur} (${data.wilayah?.desa}, ${data.wilayah?.kecamatan}, ${data.wilayah?.kabupaten}, ${data.wilayah?.provinsi})`
        );
      } else {
        setError(data.message || "Gagal melakukan registrasi");
      }

    } catch (err) {
      console.error("Error submitting registration:", err);
      setError("Gagal mengirim data. Pastikan backend berjalan.");
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
      kodeJenis: ""
    });
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);
    setRegSumur("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <FileText className="h-3 w-3 mr-1" />
            Registrasi Sumur Berbasis Wilayah
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Registrasi Sumur
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistem registrasi otomatis dengan fuzzy matching untuk mencegah duplikasi
          </p>
          {error && (
            <Badge variant="destructive" className="mt-2">
              {error}
            </Badge>
          )}
        </div>

        <Card className="w-full">
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
            {/* Toggle Input Mode */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={toggleInputMode}
                className="gap-2"
              >
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
              {/* Wilayah Input */}
              <div className="border rounded-lg p-4 bg-gray-50/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Data Wilayah
                </h3>
                
                {useManualInput ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Provinsi</label>
                      <input
                        name="provinsi"
                        placeholder="Masukkan nama provinsi"
                        value={selected.provinsi}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kabupaten/Kota</label>
                      <input
                        name="kabupaten"
                        placeholder="Masukkan kabupaten/kota"
                        value={selected.kabupaten}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kecamatan</label>
                      <input
                        name="kecamatan"
                        placeholder="Masukkan kecamatan"
                        value={selected.kecamatan}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Desa/Kelurahan</label>
                      <input
                        name="desa"
                        placeholder="Masukkan desa/kelurahan"
                        value={selected.desa}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Provinsi</label>
                      <select
                        name="provinsi"
                        value={selected.provinsi}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">-- Pilih Provinsi --</option>
                        {provinsiList.map(p => (
                          <option key={p.kode} value={p.nama}>{p.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kabupaten/Kota</label>
                      <select
                        name="kabupaten"
                        value={selected.kabupaten}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">-- Pilih Kabupaten/Kota --</option>
                        {kabupatenList.map(k => (
                          <option key={k.kode} value={k.nama}>{k.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kecamatan</label>
                      <select
                        name="kecamatan"
                        value={selected.kecamatan}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">-- Pilih Kecamatan --</option>
                        {kecamatanList.map(k => (
                          <option key={k.kode} value={k.nama}>{k.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Desa/Kelurahan</label>
                      <select
                        name="desa"
                        value={selected.desa}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">-- Pilih Desa/Kelurahan --</option>
                        {desaList.map(d => (
                          <option key={d.kode} value={d.nama}>{d.nama}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Jenis Sumur */}
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
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Pilih jenis sumur</option>
                  <option value="0">0 - Sumur Dangkal</option>
                  <option value="1">1 - Sumur Dalam</option>
                  <option value="2">2 - Sumur Artesis</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="lg" 
                  className="w-full"
                >
                  <Droplets className="h-5 w-5 mr-2" />
                  {loading ? "Mendaftarkan..." : "Daftarkan Sumur"}
                </Button>
              </div>
            </form>

            {/* Result Display */}
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
    </div>
  );
}
