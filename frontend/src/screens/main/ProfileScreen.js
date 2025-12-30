import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import CoinDisplay from '../../components/custom/CoinDisplay';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useServers } from '../../hooks/useServers';

// Services
import { updateProfile, changePassword, getReferralStats } from '../../services/api';

// Validation Schema
const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone must contain only numbers')
    .min(10, 'Phone must be at least 10 digits'),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuth();
  const { servers } = useServers();
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [referralStats, setReferralStats] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      const stats = await getReferralStats();
      setReferralStats(stats);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const updatedUser = await updateProfile(values);
      updateUser(updatedUser);
      showMessage({
        message: 'Profile updated successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to update profile',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values, { resetForm }) => {
    try {
      setPasswordLoading(true);
      await changePassword(values);
      resetForm();
      setShowPasswordForm(false);
      showMessage({
        message: 'Password changed successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to change password',
        type: 'danger',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      // Implement copy to clipboard
      showMessage({
        message: 'Referral code copied to clipboard',
        type: 'success',
      });
    }
  };

  const handleShareReferral = () => {
    // Implement share functionality
    navigation.navigate('Referrals');
  };

  const handleViewReferrals = () => {
    navigation.navigate('Referrals');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const runningServers = servers?.filter(s => s.status === 'running') || [];
  const stoppedServers = servers?.filter(s => s.status === 'stopped') || [];

  return (
    <Layout headerProps={{ title: 'Profile' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.headerCard} gradient>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.avatarBadge}>
                <Icon name="check-decagram" size={16} color="#FFF" />
              </View>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{user?.name || 'User'}</Text>
              <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.joined}>
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}
              </Text>
            </View>
            <CoinDisplay coins={user?.coins} size="small" />
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Icon name="server" size={24} color="#667eea" />
            <Text style={styles.statValue}>{servers?.length || 0}</Text>
            <Text style={styles.statLabel}>Servers</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Icon name="play" size={24} color="#10b981" />
            <Text style={styles.statValue}>{runningServers.length}</Text>
            <Text style={styles.statLabel}>Running</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Icon name="stop" size={24} color="#ef4444" />
            <Text style={styles.statValue}>{stoppedServers.length}</Text>
            <Text style={styles.statLabel}>Stopped</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Icon name="account-group" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{referralStats?.totalReferrals || 0}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </Card>
        </View>

        {/* Referral Section */}
        <Card style={styles.referralCard}>
          <View style={styles.referralHeader}>
            <Icon name="gift" size={24} color="#f59e0b" />
            <Text style={styles.referralTitle}>Referral System</Text>
          </View>
          
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralLabel}>Your Referral Code:</Text>
            <TouchableOpacity
              style={styles.referralCodeBox}
              onPress={handleCopyReferralCode}
            >
              <Text style={styles.referralCode}>{user?.referralCode || '------'}</Text>
              <Icon name="content-copy" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.referralStats}>
            <View style={styles.referralStat}>
              <Text style={styles.referralStatValue}>
                {referralStats?.totalEarned || 0}
              </Text>
              <Text style={styles.referralStatLabel}>Coins Earned</Text>
            </View>
            <View style={styles.referralStat}>
              <Text style={styles.referralStatValue}>
                {referralStats?.referralBonus || 1}
              </Text>
              <Text style={styles.referralStatLabel}>Per Referral</Text>
            </View>
          </View>
          
          <View style={styles.referralActions}>
            <Button
              title="Share Referral"
              onPress={handleShareReferral}
              variant="primary"
              size="small"
              icon="share-variant"
            />
            <Button
              title="View Referrals"
              onPress={handleViewReferrals}
              variant="outline"
              size="small"
              icon="account-group"
            />
          </View>
        </Card>

        {/* Update Profile Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Update Profile</Text>
          
          <Formik
            initialValues={{
              name: user?.name || '',
              phone: user?.phone || '',
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleUpdateProfile}
            enableReinitialize
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && errors.name}
                  icon="account"
                />

                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={user?.email || ''}
                  disabled
                  icon="email"
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={touched.phone && errors.phone}
                  icon="phone"
                  keyboardType="phone-pad"
                />

                <Button
                  title={loading ? 'Updating...' : 'Update Profile'}
                  onPress={handleSubmit}
                  variant="primary"
                  loading={loading}
                  style={styles.submitButton}
                />
              </View>
            )}
          </Formik>
        </Card>

        {/* Change Password */}
        <Card style={styles.formCard}>
          <View style={styles.passwordHeader}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordForm(!showPasswordForm)}>
              <Icon
                name={showPasswordForm ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#667eea"
              />
            </TouchableOpacity>
          </View>
          
          {showPasswordForm && (
            <Formik
              initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              }}
              validationSchema={PasswordSchema}
              onSubmit={handleChangePassword}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.form}>
                  <Input
                    label="Current Password"
                    placeholder="Enter current password"
                    value={values.currentPassword}
                    onChangeText={handleChange('currentPassword')}
                    onBlur={handleBlur('currentPassword')}
                    error={touched.currentPassword && errors.currentPassword}
                    secureTextEntry
                    icon="lock"
                  />

                  <Input
                    label="New Password"
                    placeholder="Enter new password"
                    value={values.newPassword}
                    onChangeText={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                    error={touched.newPassword && errors.newPassword}
                    secureTextEntry
                    icon="lock-plus"
                  />

                  <Input
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={touched.confirmPassword && errors.confirmPassword}
                    secureTextEntry
                    icon="lock-check"
                  />

                  <Button
                    title={passwordLoading ? 'Changing...' : 'Change Password'}
                    onPress={handleSubmit}
                    variant="primary"
                    loading={passwordLoading}
                    style={styles.submitButton}
                  />
                </View>
              )}
            </Formik>
          )}
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Transactions')}
          >
            <Icon name="history" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Transaction History</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="cog" size={24} color="#6b7280" />
            <Text style={styles.actionText}>Settings</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Support')}
          >
            <Icon name="help-circle" size={24} color="#10b981" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={24} color="#ef4444" />
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
            <Icon name="chevron-right" size={24} color="#ef4444" />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10b981',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  joined: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  referralCard: {
    marginBottom: 16,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  referralCodeContainer: {
    marginBottom: 16,
  },
  referralLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  referralStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  referralStat: {
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  referralActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  formCard: {
    marginBottom: 16,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
  actionsCard: {
    marginBottom: 32,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ef4444',
  },
});

export default ProfileScreen;
