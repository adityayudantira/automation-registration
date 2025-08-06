import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Droplets, ArrowLeft, BarChart3, Users, MapPin, Calendar, Search, Filter, Download, Trash2, Edit, X } from "lucide-react";
//console.log("📦 ENV:", import.meta.env); // Lihat semua variabel env
//console.log("🔑 VITE_API_URL is:", import.meta.env.VITE_API_URL);
//console.log("📦 ENV ALL:", import.meta.env);
//console.log("🔑 VITE_API_URL:", import.meta.env.VITE_API_URL);

export default function Dashboard() {
  const [sumurData, setSumurData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nama_perusahaan: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    desa: "",
    jenis: "",
    status: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredData = sumurData.filter(item => {
    const matchesSearch = (item.reg_sumur ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.nama_perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.kabupaten.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterJenis === "all" || String(item.jenis) === filterJenis;
    return matchesSearch && matchesFilter;
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  //console.log("VITE_API_URL is:", import.meta.env.VITE_API_URL);

useEffect(() => {
  const fetchSumur = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/registrasi`;
      //console.log("🔍 Fetching from:", url);
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }

      const json = await res.json();
      setSumurData(json);
    } catch (err) {
      console.error("Gagal fetch sumur", err);
    }
  };

  fetchSumur();
}, []);

useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, filterJenis]);

  const stats = [
    { label: "Total Sumur", value: sumurData.length, icon: <Droplets className="h-6 w-6" /> },
    { label: "Sumur Aktif", value: sumurData.filter(s => s.status === "Aktif").length, icon: <BarChart3 className="h-6 w-6" /> },
    { label: "Provinsi", value: new Set(sumurData.map(s => s.provinsi)).size, icon: <MapPin className="h-6 w-6" /> },
    { label: "Registrasi Bulan Ini", value: 3, icon: <Calendar className="h-6 w-6" /> }
  ];

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditFormData({
    nama_perusahaan: item.nama_perusahaan === "-" ? "" : item.  nama_perusahaan,
    provinsi: item.provinsi === "-" ? "" : item.provinsi,
    kabupaten: item.kabupaten === "-" ? "" : item.kabupaten,
    kecamatan: item.kecamatan === "-" ? "" : item.kecamatan,
    desa: item.desa === "-" ? "" : item.desa,
    jenis: String(item.jenis), // agar bisa masuk ke select
    status: item.status || "Aktif"
  });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setSumurData(prev => prev.map(item =>
      item.id === selectedItem.id
        ? { ...item, ...editFormData, jenis: parseInt(editFormData.jenis) }
        : item
    ));
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

const confirmDelete = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/registrasi/${selectedItem.id}`, {
      method: "DELETE"
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal menghapus");

    setSumurData(prev => prev.filter(item => item.id !== selectedItem.id));
    setShowDeleteModal(false);
    setSelectedItem(null);
  } catch (err) {
    alert("Gagal menghapus data: " + err.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground"><p>Tim Air Tanah</p></span>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Sumur</h1>
              <p className="text-muted-foreground">Kelola dan pantau data registrasi sumur air tanah</p>
            </div>
            <Link to="/registrasi-sumur">
              <Button className="gap-2">
                <Droplets className="h-4 w-4" />
                Registrasi Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="text-primary">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filter Data Sumur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nomor registrasi, nama perusahaan, provinsi, atau kabupaten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterJenis}
                  onChange={(e) => setFilterJenis(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="0">Sumur Produksi (0)</option>
                  <option value="1">Sumur Pantau (1)</option>
                  <option value="2">Sumur Penggunaan (2)</option>
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sumur Terdaftar</CardTitle>
            <CardDescription>
              Daftar semua sumur yang telah terdaftar dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">No. Registrasi</th>
                    <th className="text-left p-4 font-medium">Nama Perusahaan</th>
                    <th className="text-left p-4 font-medium">Lokasi</th>
                    <th className="text-left p-4 font-medium">Jenis</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50/50">
                      <td className="p-4">
                        <span className="font-mono text-sm font-semibold">{(item.reg_sumur ?? "")}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium">{item.nama_perusahaan}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium">{item.desa}, {item.kecamatan}</div>
                          <div className="text-muted-foreground">{item.kabupaten}, {item.provinsi}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                         {item.jenis === 0 ? "Produksi" : item.jenis === 1 ? "Pantau" : "Penggunaan"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={item.status === "Aktif" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data sumur yang ditemukan
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              {/* Jumlah per halaman */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Tampilkan</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1); // reset ke halaman pertama
                  }}
                  className="border px-2 py-1 rounded"
                >
                  {[5, 10, 20, 50].map((jumlah) => (
                    <option key={jumlah} value={jumlah}>{jumlah}</option>
                  ))}
                </select>
                <span className="text-sm">data per halaman</span>
              </div>

              {/* Navigasi halaman */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Data Sumur</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Perusahaan</label>
                <input
                  type="text"
                  value={editFormData.nama_perusahaan}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, nama_perusahaan: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Provinsi</label>
                  <input
                    type="text"
                    value={editFormData.provinsi}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, provinsi: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kabupaten</label>
                  <input
                    type="text"
                    value={editFormData.kabupaten}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, kabupaten: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kecamatan</label>
                  <input
                    type="text"
                    value={editFormData.kecamatan}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, kecamatan: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Desa</label>
                  <input
                    type="text"
                    value={editFormData.desa}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, desa: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Jenis Sumur</label>
                  <select
                    value={editFormData.jenis}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, jenis: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="0">Sumur Produksi (0)</option>
                    <option value="1">Sumur Pantau (1)</option>
                    <option value="2">Sumur Penggunaan (2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pending">Pending</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Batal
              </Button>
              <Button onClick={handleSaveEdit}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Konfirmasi Hapus</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Apakah Anda yakin akan menghapus data sumur berikut?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold">No. Registrasi: {selectedItem.reg_sumur ?? ""}</div>
                <div className="text-sm text-gray-600">Perusahaan: {selectedItem.nama_perusahaan}</div>
                <div className="text-sm text-gray-600">
                  Lokasi: {selectedItem.desa}, {selectedItem.kecamatan}, {selectedItem.kabupaten}
                </div>
              </div>
              <p className="text-red-600 text-sm mt-2 font-medium">
                Data yang dihapus tidak dapat dikembalikan!
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Hapus Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
