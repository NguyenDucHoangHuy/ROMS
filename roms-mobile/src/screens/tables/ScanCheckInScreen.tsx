import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ChevronLeft,
  QrCode,
  Search,
  Flashlight,
  FlashlightOff,
  Users,
  Phone,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  RotateCcw,
  Sparkles,
  Utensils,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';
import {
  reservationService,
  ReservationData,
  TableItem,
} from '@/services/reservationService';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.72;

export const ScanCheckInScreen = () => {
  const navigation = useNavigation<any>();

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');

  // Input & search state
  const [manualCode, setManualCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Result & Check-in modal state
  const [scanned, setScanned] = useState(false);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [availableTables, setAvailableTables] = useState<TableItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isChangingTable, setIsChangingTable] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

  // Fetch tables on mount to allow assignment if reservation isn't assigned yet
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await reservationService.getTables();
      if (Array.isArray(data)) {
        setAvailableTables(data);
      }
    } catch (e) {
      console.warn('Không thể tải danh sách bàn:', e);
    }
  };

  // Tra cứu đặt bàn theo mã ID, code hoặc số điện thoại
  const handleLookup = async (code: string) => {
    const query = code.trim();
    if (!query) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã đặt bàn hoặc số điện thoại');
      return;
    }

    setIsSearching(true);
    try {
      const data = await reservationService.getByCode(query);
      if (data) {
        setReservation(data);
        setSelectedTableId(data.tableId || null);
        setIsChangingTable(!data.tableId); // Tự động mở chọn bàn nếu chưa gán bàn
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Không tìm thấy thông tin đặt bàn với mã hoặc SĐT này.';
      Alert.alert('Không tìm thấy', msg, [
        {
          text: 'Thử lại',
          onPress: () => {
            setScanned(false);
          },
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý khi camera quét thấy mã QR
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || !data) return;
    setScanned(true);
    handleLookup(data);
  };

  // Đóng modal kết quả để quét tiếp
  const handleResetScan = () => {
    setReservation(null);
    setScanned(false);
    setManualCode('');
    setIsChangingTable(false);
  };

  // Xác nhận Check-in cho khách
  const handleConfirmCheckIn = async () => {
    if (!reservation) return;

    const targetTableId = selectedTableId || reservation.tableId;

    if (!targetTableId) {
      Alert.alert(
        'Chưa chọn bàn',
        'Vui lòng chọn một bàn trống cho khách trước khi hoàn tất check-in.'
      );
      setIsChangingTable(true);
      return;
    }

    setIsSubmittingCheckIn(true);
    try {
      const checkedIn = await reservationService.checkIn(
        reservation.id,
        targetTableId
      );

      // Tìm tên bàn đã check-in
      const assignedTable = availableTables.find((t) => t.id === targetTableId);
      const tableName =
        assignedTable?.tableNumber || reservation.table?.tableNumber || 'đã chọn';

      Alert.alert(
        'Check-in Thành Công! 🎉',
        `Khách hàng "${reservation.guestName}" đã nhận Bàn ${tableName}.\nTrạng thái bàn đã chuyển sang Đang phục vụ.`,
        [
          {
            text: 'Vào bàn lên món',
            onPress: () => {
              handleResetScan();
              navigation.replace(ROUTES.STACKS.TABLE_DETAIL, {
                tableId: targetTableId,
                tableNumber: tableName,
              });
            },
          },
          {
            text: 'Về sơ đồ bàn',
            style: 'cancel',
            onPress: () => {
              handleResetScan();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        'Đã xảy ra lỗi trong quá trình check-in. Vui lòng thử lại.';
      Alert.alert('Lỗi Check-in', errorMsg);
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  // Định dạng thời gian đặt bàn
  const formatReservationTime = (isoString?: string) => {
    if (!isoString) return '---';
    try {
      const d = new Date(isoString);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      const date = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${hours}:${mins} • ${date}/${month}`;
    } catch {
      return isoString;
    }
  };

  // Lọc bàn còn trống hoặc phù hợp
  const selectableTables = availableTables.filter(
    (t) => t.status === 'AVAILABLE' || t.id === reservation?.tableId
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét QR Check-in</Text>
        <TouchableOpacity
          style={[styles.torchBtn, torch && styles.torchBtnActive]}
          onPress={() => setTorch((prev) => !prev)}
          activeOpacity={0.7}
        >
          {torch ? (
            <Flashlight size={20} color={theme.colors.textOnPrimary} />
          ) : (
            <FlashlightOff size={20} color={theme.colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Mode Switch Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'camera' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('camera');
            setScanned(false);
          }}
          activeOpacity={0.8}
        >
          <QrCode
            size={18}
            color={
              activeTab === 'camera'
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'camera' && styles.tabTextActive,
            ]}
          >
            Quét Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'manual' && styles.tabItemActive]}
          onPress={() => setActiveTab('manual')}
          activeOpacity={0.8}
        >
          <Search
            size={18}
            color={
              activeTab === 'manual'
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'manual' && styles.tabTextActive,
            ]}
          >
            Nhập mã / SĐT
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera Scanning View */}
      {activeTab === 'camera' && (
        <View style={styles.cameraContainer}>
          {!permission ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.permText}>Đang kiểm tra quyền camera...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.centerBox}>
              <AlertCircle size={48} color={theme.colors.warning} />
              <Text style={styles.permTitle}>Cần quyền truy cập Camera</Text>
              <Text style={styles.permDesc}>
                Cho phép ROMS sử dụng camera điện thoại để quét mã QR check-in
                nhanh chóng cho khách hàng.
              </Text>
              <TouchableOpacity
                style={styles.grantBtn}
                onPress={requestPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.grantBtnText}>Cấp quyền Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={StyleSheet.absoluteFill}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={torch}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />

              {/* Viewfinder Overlay */}
              <View style={styles.overlayLayer}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayMiddleRow}>
                  <View style={styles.overlaySide} />
                  <View style={styles.viewfinderFrame}>
                    {/* 4 Corner Markers */}
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />

                    {isSearching && (
                      <View style={styles.searchingOverlay}>
                        <ActivityIndicator
                          size="large"
                          color={theme.colors.primary}
                        />
                        <Text style={styles.searchingText}>
                          Đang tra cứu thông tin...
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                  <Text style={styles.scanInstruction}>
                    Hướng camera vào mã QR trên điện thoại khách hàng
                  </Text>
                  {scanned && !reservation && !isSearching && (
                    <TouchableOpacity
                      style={styles.rescanBtn}
                      onPress={() => setScanned(false)}
                    >
                      <RotateCcw size={16} color="#FFF" />
                      <Text style={styles.rescanBtnText}>Quét lại</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Manual Search View */}
      {activeTab === 'manual' && (
        <ScrollView
          contentContainerStyle={styles.manualContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.manualCard}>
            <Text style={styles.manualTitle}>Tra cứu đơn đặt bàn</Text>
            <Text style={styles.manualSub}>
              Nhập mã đặt bàn (UUID) hoặc số điện thoại khách đã đăng ký khi đặt
              trên web.
            </Text>

            <View style={styles.inputWrapper}>
              <Search size={20} color={theme.colors.textMuted} />
              <TextInput
                style={styles.inputField}
                placeholder="Nhập mã đặt bàn hoặc SĐT khách..."
                placeholderTextColor={theme.colors.textMuted}
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => handleLookup(manualCode)}
              />
              {manualCode.length > 0 && (
                <TouchableOpacity onPress={() => setManualCode('')}>
                  <X size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.searchActionBtn,
                isSearching && { opacity: 0.7 },
              ]}
              onPress={() => handleLookup(manualCode)}
              disabled={isSearching}
              activeOpacity={0.8}
            >
              {isSearching ? (
                <ActivityIndicator color={theme.colors.textOnPrimary} />
              ) : (
                <>
                  <Search size={18} color={theme.colors.textOnPrimary} />
                  <Text style={styles.searchActionText}>Tìm thông tin đặt bàn</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Check-In Details Modal / Sheet */}
      <Modal
        visible={!!reservation}
        animationType="slide"
        transparent={true}
        onRequestClose={handleResetScan}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheetCard}>
            {/* Sheet Handle & Close */}
            <View style={styles.sheetHeader}>
              <View style={styles.dragBar} />
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleResetScan}
              >
                <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {reservation && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetContent}
              >
                {/* Guest Identity Card */}
                <View style={styles.guestCard}>
                  <View style={styles.guestAvatar}>
                    <Users size={22} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guestName}>{reservation.guestName}</Text>
                    <View style={styles.guestMetaRow}>
                      <Phone size={13} color={theme.colors.textMuted} />
                      <Text style={styles.guestPhone}>
                        {reservation.guestPhone}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      reservation.status === 'CONFIRMED'
                        ? styles.badgeConfirmed
                        : styles.badgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        reservation.status === 'CONFIRMED'
                          ? styles.badgeTextConfirmed
                          : styles.badgeTextPending,
                      ]}
                    >
                      {reservation.status === 'CONFIRMED'
                        ? 'Đã duyệt'
                        : reservation.status === 'COMPLETED'
                        ? 'Đã nhận bàn'
                        : 'Chờ duyệt'}
                    </Text>
                  </View>
                </View>

                {/* Reservation Key Specs Grid */}
                <View style={styles.specsGrid}>
                  <View style={styles.specBox}>
                    <Clock size={16} color={theme.colors.primary} />
                    <Text style={styles.specLabel}>Giờ đặt</Text>
                    <Text style={styles.specValue}>
                      {formatReservationTime(reservation.reservationTime)}
                    </Text>
                  </View>

                  <View style={styles.specBox}>
                    <Users size={16} color={theme.colors.primary} />
                    <Text style={styles.specLabel}>Số lượng khách</Text>
                    <Text style={styles.specValue}>
                      {reservation.partySize} người
                    </Text>
                  </View>
                </View>

                {/* Special Request */}
                {reservation.specialRequest ? (
                  <View style={styles.noteBox}>
                    <FileText size={16} color={theme.colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noteTitle}>Yêu cầu đặc biệt:</Text>
                      <Text style={styles.noteDesc}>
                        {reservation.specialRequest}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {/* Pre-ordered Dishes Section */}
                {reservation.reservationItems &&
                reservation.reservationItems.length > 0 ? (
                  <View style={styles.preOrderBox}>
                    <View style={styles.preOrderHeader}>
                      <Utensils size={16} color={theme.colors.primary} />
                      <Text style={styles.preOrderTitle}>
                        Món khách gọi trước ({reservation.reservationItems.length} món):
                      </Text>
                    </View>
                    <View style={styles.preOrderList}>
                      {reservation.reservationItems.map((item) => (
                        <View key={item.id} style={styles.preOrderItemRow}>
                          <Text style={styles.preOrderItemName} numberOfLines={1}>
                            • {item.menuItem?.name || 'Món ăn'}
                          </Text>
                          <Text style={styles.preOrderItemQty}>
                            x{item.quantity}
                          </Text>
                          <Text style={styles.preOrderItemPrice}>
                            ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}


                {/* Table Assignment Section */}
                <View style={styles.tableAssignSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Bàn phục vụ</Text>
                    <TouchableOpacity
                      onPress={() => setIsChangingTable((prev) => !prev)}
                    >
                      <Text style={styles.changeTableBtn}>
                        {isChangingTable ? 'Thu gọn' : 'Đổi / Chọn bàn'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Hiện bàn đang gán */}
                  {!isChangingTable && (
                    <View style={styles.currentTableCard}>
                      <MapPin size={20} color={theme.colors.primary} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.currentTableName}>
                          {selectedTableId
                            ? `Bàn ${
                                availableTables.find(
                                  (t) => t.id === selectedTableId
                                )?.tableNumber || reservation.table?.tableNumber
                              }`
                            : reservation.table
                            ? `Bàn ${reservation.table.tableNumber}`
                            : 'Chưa gán bàn nào'}
                        </Text>
                        <Text style={styles.currentTableSub}>
                          {selectedTableId
                            ? `Tầng ${
                                availableTables.find(
                                  (t) => t.id === selectedTableId
                                )?.floor || 1
                              } • Sức chứa ${
                                availableTables.find(
                                  (t) => t.id === selectedTableId
                                )?.capacity || 4
                              } khách`
                            : 'Nhấn "Chọn bàn" để gán bàn cho khách'}
                        </Text>
                      </View>
                      <CheckCircle2 size={22} color={theme.colors.success} />
                    </View>
                  )}

                  {/* Danh sách chọn bàn trống */}
                  {isChangingTable && (
                    <View style={styles.tablePickerContainer}>
                      <Text style={styles.pickerSubText}>
                        Chọn bàn trống phù hợp cho {reservation.partySize} người:
                      </Text>
                      <View style={styles.tableGrid}>
                        {selectableTables.length === 0 ? (
                          <Text style={styles.emptyTableText}>
                            Hiện không còn bàn trống nào.
                          </Text>
                        ) : (
                          selectableTables.map((t) => {
                            const isSelected = selectedTableId === t.id;
                            const isFitting = t.capacity >= reservation.partySize;
                            return (
                              <TouchableOpacity
                                key={t.id}
                                style={[
                                  styles.tableItemCard,
                                  isSelected && styles.tableItemCardSelected,
                                ]}
                                onPress={() => {
                                  setSelectedTableId(t.id);
                                  setIsChangingTable(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.tableItemTitle,
                                    isSelected && styles.tableItemTitleSelected,
                                  ]}
                                >
                                  Bàn {t.tableNumber}
                                </Text>
                                <Text style={styles.tableItemMeta}>
                                  Tầng {t.floor} • {t.capacity} chỗ
                                </Text>
                                {isFitting && (
                                  <View style={styles.fitTag}>
                                    <Sparkles
                                      size={10}
                                      color={theme.colors.success}
                                    />
                                    <Text style={styles.fitTagText}>Phù hợp</Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })
                        )}
                      </View>
                    </View>
                  )}
                </View>

                {/* Check-In CTA Button */}
                <TouchableOpacity
                  style={[
                    styles.confirmCheckInBtn,
                    isSubmittingCheckIn && { opacity: 0.7 },
                  ]}
                  onPress={handleConfirmCheckIn}
                  disabled={isSubmittingCheckIn}
                  activeOpacity={0.85}
                >
                  {isSubmittingCheckIn ? (
                    <ActivityIndicator color={theme.colors.textOnPrimary} />
                  ) : (
                    <>
                      <CheckCircle2
                        size={22}
                        color={theme.colors.textOnPrimary}
                      />
                      <Text style={styles.confirmCheckInText}>
                        Xác nhận Check-in & Mở bàn
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelSheetBtn}
                  onPress={handleResetScan}
                >
                  <Text style={styles.cancelSheetText}>Quét đơn khác</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  preOrderBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  preOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  preOrderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
  },
  preOrderList: {
    gap: 6,
  },
  preOrderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  preOrderItemName: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: theme.colors.text,
  },
  preOrderItemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginHorizontal: 8,
  },
  preOrderItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },

  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFF',
  },
  torchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchBtnActive: {
    backgroundColor: theme.colors.primary,
  },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.xl,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  tabItemActive: {
    backgroundColor: '#FFF',
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },

  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: 16,
  },
  permTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFF',
    textAlign: 'center',
  },
  permDesc: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  permText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  grantBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    marginTop: 8,
  },
  grantBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },

  overlayLayer: {
    ...StyleSheet.absoluteFill,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddleRow: {
    flexDirection: 'row',
    height: SCAN_FRAME_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  viewfinderFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: theme.colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  searchingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 8,
  },
  searchingText: {
    color: '#FFF',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  overlayBottom: {
    flex: 1.2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  scanInstruction: {
    color: '#FFF',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
  },
  rescanBtnText: {
    color: '#FFF',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },

  manualContainer: {
    padding: theme.spacing.md,
  },
  manualCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  manualTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: 6,
  },
  manualSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    height: 52,
    gap: 10,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  searchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  searchActionText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  dragBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.borderDark,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 10,
    padding: 6,
  },
  sheetContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 20,
    gap: 16,
  },

  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.occupiedBorder,
  },
  guestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  guestMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  guestPhone: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgeConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  badgeTextConfirmed: {
    color: '#15803D',
  },
  badgeTextPending: {
    color: '#B45309',
  },

  specsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  specBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 4,
  },
  specLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  specValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
  },
  noteTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: '#B45309',
  },
  noteDesc: {
    fontSize: theme.fontSize.xs,
    color: '#78350F',
    marginTop: 2,
  },

  tableAssignSection: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  changeTableBtn: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  currentTableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currentTableName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  currentTableSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  tablePickerContainer: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  pickerSubText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyTableText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    fontStyle: 'italic',
  },
  tableItemCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.md,
    padding: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: 2,
  },
  tableItemCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  tableItemTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  tableItemTitleSelected: {
    color: theme.colors.primary,
  },
  tableItemMeta: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  fitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  fitTagText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },

  confirmCheckInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
    marginTop: 8,
    ...theme.shadow.md,
  },
  confirmCheckInText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  cancelSheetBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelSheetText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
});
