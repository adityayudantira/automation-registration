import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Droplets, ArrowLeft, MapPin, Calendar, Search, Download, Eye, BarChart3, X, ExternalLink, FileText, Edit, CheckCircle, LogOut, User } from "lucide-react";

export default function DataSumur() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleExportData = () => {
    // Create export data based on user's access
    const exportData = filteredData.map(item => ({
      no_registrasi: item.reg_sumur,
      nama_perusahaan: item.nama_perusahaan,
      lokasi: `${item.desa}, ${item.kecamatan}, ${item.kabupaten}, ${item.provinsi}`,
      jenis_sumur: item.jenis,
      kedalaman: item.kedalaman,
      diameter: item.diameter,
      kapasitas: item.kapasitas,
      status: item.status,
      tanggal_registrasi: item.tanggal,
      koordinat: item.koordinat,
      user_export: user?.name,
      waktu_export: new Date().toISOString()
    }));

    // Convert to CSV
    const csvContent = [
      // Headers
      [
        'No Registrasi', 'Nama Perusahaan', 'Lokasi', 'Jenis Sumur', 'Kedalaman',
        'Diameter', 'Kapasitas', 'Status', 'Tanggal Registrasi', 'Koordinat',
        'User Export', 'Waktu Export'
      ].join(','),
      // Data rows
      ...exportData.map(row => [
        row.no_registrasi, `"${row.nama_perusahaan}"`, `"${row.lokasi}"`, row.jenis_sumur,
        row.kedalaman, row.diameter, row.kapasitas, row.status, row.tanggal_registrasi,
        row.koordinat, `"${row.user_export}"`, row.waktu_export
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_sumur_${user?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvinsi, setSelectedProvinsi] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSumur, setSelectedSumur] = useState(null);
  const [editFormData, setEditFormData] = useState({
    tanggal_terbit: "",
    masa_berlaku: "",
    diameter: "",
    debit_diizinkan: "",
    latitude: "",
    longitude: ""
  });
  const [mockData, setMockData] = useState([]);

  const [mockDataState, setMockDataState] = useState([
    {
      id: "1",
      reg_sumur: "13.1.001",
      nama_perusahaan: "PT. Aqua Maju Sejahtera",
      id_pemohon: "PEM001",
      provinsi: "Jawa Barat",
      kabupaten: "Kabupaten Bogor",
      kecamatan: "Nanggung",
      desa: "Bantarjaya",
      jenis: "Sumur Pantau",
      jenis_kode: "1",
      kedalaman: "45m",
      diameter: "6 inch",
      kapasitas: "50 m³/hari",
      status: "Aktif",
      tanggal: "2024-01-15",
      koordinat: "-6.123456, 106.789012",
      latitude: "-6.123456",
      longitude: "106.789012",
      alamat_lengkap: "Jl. Raya Nanggung No. 123, Bantarjaya, Nanggung, Kabupaten Bogor, Jawa Barat",
      tanggal_terbit: "2024-01-15",
      masa_berlaku: "2029-01-15",
      debit_diizinkan: "50 m³/hari"
    },
    {
      id: "2",
      reg_sumur: "13.2.002",
      nama_perusahaan: "CV. Sumber Air Mandiri",
      id_pemohon: "PEM002",
      provinsi: "Jawa Barat",
      kabupaten: "Kota Bandung",
      kecamatan: "Sukasari",
      desa: "Gegerkalong",
      jenis: "Sumur Produksi",
      jenis_kode: "0",
      kedalaman: "15m",
      diameter: "4 inch",
      kapasitas: "25 m³/hari",
      status: "Aktif",
      tanggal: "2024-01-20",
      koordinat: "-6.234567, 107.890123",
      latitude: "-6.234567",
      longitude: "107.890123",
      alamat_lengkap: "Jl. Setiabudhi No. 456, Gegerkalong, Sukasari, Kota Bandung, Jawa Barat",
      tanggal_terbit: "",
      masa_berlaku: "",
      debit_diizinkan: "",
    },
    {
      id: "3",
      reg_sumur: "13.1.003",
      nama_perusahaan: "PT. Tirta Bersih Nusantara",
      id_pemohon: "PEM003",
      provinsi: "Jawa Tengah",
      kabupaten: "Kota Semarang",
      kecamatan: "Tembalang",
      desa: "Sendangguwo",
      jenis: "Sumur Penggunaan",
      jenis_kode: "2",
      kedalaman: "80m",
      diameter: "8 inch",
      kapasitas: "100 m³/hari",
      status: "Pending",
      tanggal: "2024-01-25",
      koordinat: "-7.123456, 110.789012",
      latitude: "-7.123456",
      longitude: "110.789012",
      alamat_lengkap: "Jl. Prof. Soedarto No. 789, Sendangguwo, Tembalang, Kota Semarang, Jawa Tengah",
      tanggal_terbit: "",
      masa_berlaku: "",
      debit_diizinkan: ""
    },
    {
      id: "4",
      reg_sumur: "13.1.004",
      nama_perusahaan: "PT. Hidro Teknologi Indonesia",
      id_pemohon: "PEM004",
      provinsi: "Jawa Timur",
      kabupaten: "Kota Surabaya",
      kecamatan: "Gubeng",
      desa: "Gubeng",
      jenis: "Sumur Pantau",
      jenis_kode: "1",
      kedalaman: "60m",
      diameter: "6 inch",
      kapasitas: "75 m³/hari",
      status: "Aktif",
      tanggal: "2024-02-01",
      koordinat: "-7.234567, 112.890123",
      latitude: "-7.234567",
      longitude: "112.890123",
      alamat_lengkap: "Jl. Gubeng Raya No. 321, Gubeng, Kota Surabaya, Jawa Timur",
      tanggal_terbit: "",
      masa_berlaku: "",
      debit_diizinkan: "",
    }
  ]);

  const filteredData = mockDataState.filter(item => {
    const matchesSearch = item.reg_sumur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.desa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvinsi = selectedProvinsi === "all" || item.provinsi === selectedProvinsi;
    return matchesSearch && matchesProvinsi;
  });

  const provinsiList = ["Jawa Barat", "Jawa Tengah", "Jawa Timur"];
  const totalSumur = mockDataState.length;
  const sumurAktif = mockDataState.filter(s => s.status === "Aktif").length;

  const handleDetailClick = (sumur) => {
    setSelectedSumur(sumur);
    setShowDetailModal(true);
  };

  const handleLocationClick = (sumur) => {
    setSelectedSumur(sumur);
    setShowLocationModal(true);
  };

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const handleEditClick = (sumur) => {
    setSelectedSumur(sumur);
    setEditFormData({
      tanggal_terbit: sumur.tanggal_terbit || "",
      masa_berlaku: sumur.masa_berlaku || "",
      diameter: sumur.diameter || "",
      debit_diizinkan: sumur.debit_diizinkan || "",
      latitude: sumur.latitude || "",
      longitude: sumur.longitude || ""
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Check if all required fields are filled for pending wells
    const isComplete = editFormData.tanggal_terbit &&
                      editFormData.masa_berlaku &&
                      editFormData.diameter &&
                      editFormData.debit_diizinkan &&
                      editFormData.latitude &&
                      editFormData.longitude;

    const updatedData = {
      ...selectedSumur,
      ...editFormData,
      koordinat: `${editFormData.latitude}, ${editFormData.longitude}`,
      status: isComplete ? "Aktif" : "Pending"
    };

    setMockDataState(prev => prev.map(item =>
      item.id === selectedSumur.id ? updatedData : item
    ));

    setShowEditModal(false);
    setSelectedSumur(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Tim Air Tanah</span>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Beranda
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <BarChart3 className="h-3 w-3 mr-1" />
            Database Sumur Air Tanah
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Data Sumur Terdaftar
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Akses informasi lengkap semua sumur air tanah yang telah terdaftar dalam sistem
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Droplets className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground">{totalSumur}</h3>
              <p className="text-muted-foreground">Total Sumur</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground">{sumurAktif}</h3>
              <p className="text-muted-foreground">Sumur Aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground">{provinsiList.length}</h3>
              <p className="text-muted-foreground">Provinsi</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pencarian Data
            </CardTitle>
            <CardDescription>
              Cari data sumur berdasarkan nomor registrasi, lokasi, atau provinsi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari nomor registrasi, provinsi, kabupaten, atau desa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedProvinsi}
                  onChange={(e) => setSelectedProvinsi(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">Semua Provinsi</option>
                  {provinsiList.map(provinsi => (
                    <option key={provinsi} value={provinsi}>{provinsi}</option>
                  ))}
                </select>
                <Button variant="outline" className="gap-2" onClick={handleExportData}>
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <div className="grid gap-6">
          {filteredData.map((sumur) => (
            <Card key={sumur.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-lg font-bold text-primary">{sumur.reg_sumur}</span>
                      <Badge variant={sumur.status === "Aktif" ? "default" : "secondary"}>
                        {sumur.status}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Lokasi:</span>
                        </div>
                        <p className="text-muted-foreground ml-5">
                          {sumur.desa}, {sumur.kecamatan}
                        </p>
                        <p className="text-muted-foreground ml-5">
                          {sumur.kabupaten}, {sumur.provinsi}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Spesifikasi:</span>
                        </div>
                        <p className="text-muted-foreground ml-5">{sumur.jenis}</p>
                        <p className="text-muted-foreground ml-5">Kedalaman: {sumur.kedalaman}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Terdaftar: {new Date(sumur.tanggal).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDetailClick(sumur)}
                    >
                      <Eye className="h-4 w-4" />
                      Detail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleLocationClick(sumur)}
                    >
                      <MapPin className="h-4 w-4" />
                      Lokasi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleEditClick(sumur)}
                    >
                      <Edit className="h-4 w-4" />
                      {sumur.status === "Pending" ? "Lengkapi" : "Edit"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Droplets className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada data ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah kata kunci pencarian atau filter yang digunakan
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedProvinsi("all");
              }}>
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-green-100/50">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Daftarkan Sumur Baru
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Registrasikan sumur air tanah Anda untuk memastikan kepatuhan terhadap regulasi
              </p>
              <Link to="/registrasi-sumur">
                <Button size="lg" className="gap-2">
                  <Droplets className="h-5 w-5" />
                  Registrasi Sumur
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSumur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Detail Sumur {selectedSumur.reg_sumur}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Informasi Umum */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informasi Umum
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nomor Registrasi</label>
                      <p className="font-mono text-lg font-bold text-primary">{selectedSumur.reg_sumur}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nama Perusahaan</label>
                      <p className="font-semibold">{selectedSumur.nama_perusahaan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID Pemohon</label>
                      <p>{selectedSumur.id_pemohon}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Jenis Sumur</label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedSumur.jenis}</Badge>
                        <span className="text-sm text-muted-foreground">(Kode: {selectedSumur.jenis_kode})</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div>
                        <Badge variant={selectedSumur.status === "Aktif" ? "default" : "secondary"}>
                          {selectedSumur.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tanggal Registrasi</label>
                      <p>{new Date(selectedSumur.tanggal).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Masa Berlaku</label>
                      <p>{new Date(selectedSumur.masa_berlaku).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Spesifikasi Teknis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      Spesifikasi Teknis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kedalaman</label>
                      <p className="text-lg font-semibold">{selectedSumur.kedalaman}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Diameter</label>
                      <p>{selectedSumur.diameter}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kapasitas Produksi</label>
                      <p>{selectedSumur.kapasitas}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Debit yang Diizinkan</label>
                      <p>{selectedSumur.debit_diizinkan || "Belum diisi"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tanggal Terbit</label>
                      <p>{selectedSumur.tanggal_terbit ? new Date(selectedSumur.tanggal_terbit).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Belum diisi"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Lokasi */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Informasi Lokasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
                      <p>{selectedSumur.alamat_lengkap}</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                        <p>{selectedSumur.provinsi}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</label>
                        <p>{selectedSumur.kabupaten}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                        <p>{selectedSumur.kecamatan}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Desa/Kelurahan</label>
                        <p>{selectedSumur.desa}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Koordinat</label>
                      <p className="font-mono">{selectedSumur.koordinat}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && selectedSumur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Lokasi Sumur {selectedSumur.reg_sumur}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Map Preview */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Peta Lokasi</h3>
                  <p className="text-muted-foreground mb-4">
                    Koordinat: {selectedSumur.koordinat}
                  </p>
                  <Button
                    onClick={() => openGoogleMaps(selectedSumur.latitude, selectedSumur.longitude)}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka di Google Maps
                  </Button>
                </div>

                {/* Location Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Lokasi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
                      <p>{selectedSumur.alamat_lengkap}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                        <p className="font-mono">{selectedSumur.latitude}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                        <p className="font-mono">{selectedSumur.longitude}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                        <p>{selectedSumur.provinsi}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</label>
                        <p>{selectedSumur.kabupaten}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                        <p>{selectedSumur.kecamatan}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Desa/Kelurahan</label>
                        <p>{selectedSumur.desa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal for Completing Well Data */}
      {showEditModal && selectedSumur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedSumur.status === "Pending" ? "Lengkapi Data Sumur" : "Edit Data Sumur"} {selectedSumur.reg_sumur}
                </h2>
                {selectedSumur.status === "Pending" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Lengkapi semua informasi untuk mengaktifkan sumur
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Info Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-muted-foreground">Nomor Registrasi</label>
                        <p className="font-mono text-lg font-bold text-primary">{selectedSumur.reg_sumur}</p>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">Nama Perusahaan</label>
                        <p>{selectedSumur.nama_perusahaan}</p>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">Jenis Sumur</label>
                        <p>{selectedSumur.jenis}</p>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">Status Saat Ini</label>
                        <Badge variant={selectedSumur.status === "Aktif" ? "default" : "secondary"}>
                          {selectedSumur.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Editable Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Data Teknis yang Harus Dilengkapi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tanggal Terbit <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editFormData.tanggal_terbit}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, tanggal_terbit: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Masa Berlaku <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editFormData.masa_berlaku}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, masa_berlaku: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Diameter Sumur <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="contoh: 6 inch"
                          value={editFormData.diameter}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, diameter: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Debit yang Diizinkan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="contoh: 50 m³/hari"
                          value={editFormData.debit_diizinkan}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, debit_diizinkan: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="contoh: -6.123456"
                          value={editFormData.latitude}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="contoh: 106.789012"
                          value={editFormData.longitude}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, longitude: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        />
                      </div>
                    </div>

                    {selectedSumur.status === "Pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Informasi Aktivasi</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Setelah semua data dilengkapi, status sumur akan otomatis berubah menjadi "Aktif"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {selectedSumur.status === "Pending" ? "Lengkapi & Aktifkan" : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
