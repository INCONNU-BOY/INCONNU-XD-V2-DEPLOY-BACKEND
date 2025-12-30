import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useServers } from '../../hooks/useServers';

// Services
import { generateSession, validateSession, checkCoins } from '../../services/api';

// Validation Schema
const ServerSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Server name must be at least 3 characters')
    .max(50, 'Server name cannot exceed 50 characters')
    .required('Server name is required'),
  sessionId: Yup.string()
    .test('session-id', 'Invalid session ID format', (value) => {
      if (!value) return false;
      return value.startsWith('INCONNU~XD~');
    })
    .required('SESSION_ID is required'),
  ownerNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must contain only numbers')
    .min(10, 'Phone number must be at least 10 digits')
    .required('OWNER_NUMBER is required'),
  prefix: Yup.string()
    .max(3, 'Prefix cannot exceed 3 characters')
    .default('.'),
  mode: Yup.string()
    .oneOf(['public', 'private'], 'Mode must be either public or private')
    .default('public'),
});

const CreateServerScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { createServer, loading: serverLoading } = useServers();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(false);
  const [coinsCheck, setCoinsCheck] = useState(null);
  const [advancedSettings, setAdvancedSettings] = useState(false);

  // Environment variables state
  const [envVars, setEnvVars] = useState({
    SESSION_ID: '',
    PREFIX: '.',
    OWNER_NUMBER: '',
    SUDO_NUMBER: '',
    OWNER_NAME: 'INCONNU BOY',
    AUTO_STATUS_SEEN: true,
    AUTO_BIO: true,
    AUTO_STATUS_REACT: true,
    AUTO_READ: false,
    AUTO_RECORDING: false,
    AUTO_REACT: false,
    STATUS_READ_MSG: 'Status Viewed by inconnu xd v2 bot',
    ANTILINK: false,
    REJECT_CALL: false,
    NOT_ALLOW: true,
    MODE: 'public',
    WELCOME: false,
  });

  // Dropdown states
  const [modeOpen, setModeOpen] = useState(false);
  const [modeValue, setModeValue] = useState('public');
  const [modeItems, setModeItems] = useState([
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
  ]);

  useEffect(() => {
    checkUserCoins();
  }, []);

  const checkUserCoins = async () => {
    try {
      const result = await checkCoins();
      setCoinsCheck(result);
    } catch (error) {
      console.error('Failed to check coins:', error);
    }
  };

  const handleGenerateSession = async () => {
    try {
      setSessionLoading(true);
      const result = await generateSession();
      if (result.success) {
        setSessionData(result);
        setShowSessionModal(true);
      } else {
        showMessage({
          message: result.error || 'Failed to generate session',
          type: 'danger',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Failed to generate session',
        type: 'danger',
      });
    } finally {
      setSessionLoading(false);
    }
  };

  const handleValidateSession = async (sessionId) => {
    try {
      setValidatingSession(true);
      const result = await validateSession(sessionId);
      if (result.valid) {
        showMessage({
          message: 'Session ID is valid',
          type: 'success',
        });
        setEnvVars(prev => ({ ...prev, SESSION_ID: sessionId }));
      } else {
        showMessage({
          message: result.error || 'Invalid session ID',
          type: 'danger',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Failed to validate session',
        type: 'danger',
      });
    } finally {
      setValidatingSession(false);
    }
  };

  const handleOpenSessionGenerator = () => {
    const url = 'https://inconnu-tech-web-session-id.onrender.com/';
    Linking.openURL(url).catch(() => {
      showMessage({
        message: 'Could not open session generator',
        type: 'warning',
      });
    });
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateServer = async (values) => {
    try {
      setLoading(true);
      
      // Prepare environment variables
      const environment = {
        SESSION_ID: envVars.SESSION_ID,
        PREFIX: envVars.PREFIX,
        OWNER_NUMBER: envVars.OWNER_NUMBER,
        SUDO_NUMBER: envVars.SUDO_NUMBER || envVars.OWNER_NUMBER,
        OWNER_NAME: envVars.OWNER_NAME,
        AUTO_STATUS_SEEN: envVars.AUTO_STATUS_SEEN,
        AUTO_BIO: envVars.AUTO_BIO,
        AUTO_STATUS_REACT: envVars.AUTO_STATUS_REACT,
        AUTO_READ: envVars.AUTO_READ,
        AUTO_RECORDING: envVars.AUTO_RECORDING,
        AUTO_REACT: envVars.AUTO_REACT,
        STATUS_READ_MSG: envVars.STATUS_READ_MSG,
        ANTILINK: envVars.ANTILINK,
        REJECT_CALL: envVars.REJECT_CALL,
        NOT_ALLOW: envVars.NOT_ALLOW,
        MODE: envVars.MODE,
        WELCOME: envVars.WELCOME,
      };

      const serverData = {
        name: values.name,
        environment,
      };

      await createServer(serverData);
      
      showMessage({
        message: 'Server created successfully!',
        type: 'success',
      });
      
      navigation.navigate('Servers');
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to create server',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNumber}>1</Text>
        </View>
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>Basic Information</Text>
          <Text style={styles.stepDescription}>
            Enter basic details for your WhatsApp bot server
          </Text>
        </View>
      </View>

      <Formik
        initialValues={{
          name: '',
          sessionId: envVars.SESSION_ID,
          ownerNumber: '',
          prefix: '.',
          mode: 'public',
        }}
        validationSchema={ServerSchema}
        onSubmit={handleNextStep}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <View style={styles.form}>
            <Input
              label="Server Name"
              placeholder="Enter server name (e.g., My WhatsApp Bot)"
              value={values.name}
              onChangeText={(text) => {
                handleChange('name')(text);
                // Update env vars if needed
              }}
              onBlur={handleBlur('name')}
              error={touched.name && errors.name}
              icon="server"
              maxLength={50}
            />

            <View style={styles.sessionContainer}>
              <Input
                label="SESSION_ID"
                placeholder="INCONNU~XD~your_session_id"
                value={values.sessionId}
                onChangeText={(text) => {
                  handleChange('sessionId')(text);
                  setEnvVars(prev => ({ ...prev, SESSION_ID: text }));
                }}
                onBlur={handleBlur('sessionId')}
                error={touched.sessionId && errors.sessionId}
                icon="key"
                secureTextEntry
              />
              
              <View style={styles.sessionButtons}>
                <Button
                  title="Validate"
                  onPress={() => handleValidateSession(values.sessionId)}
                  variant="outline"
                  size="small"
                  loading={validatingSession}
                  disabled={!values.sessionId || values.sessionId.length < 20}
                />
                <Button
                  title="Generate"
                  onPress={handleGenerateSession}
                  variant="secondary"
                  size="small"
                  loading={sessionLoading}
                  icon="refresh"
                />
              </View>
            </View>

            <Input
              label="OWNER_NUMBER"
              placeholder="Enter your WhatsApp number (e.g., 1234567890)"
              value={values.ownerNumber}
              onChangeText={(text) => {
                handleChange('ownerNumber')(text);
                setEnvVars(prev => ({ ...prev, OWNER_NUMBER: text }));
              }}
              onBlur={handleBlur('ownerNumber')}
              error={touched.ownerNumber && errors.ownerNumber}
              icon="phone"
              keyboardType="phone-pad"
            />

            <Input
              label="PREFIX (Optional)"
              placeholder="Bot command prefix (default: .)"
              value={values.prefix}
              onChangeText={(text) => {
                handleChange('prefix')(text);
                setEnvVars(prev => ({ ...prev, PREFIX: text }));
              }}
              onBlur={handleBlur('prefix')}
              error={touched.prefix && errors.prefix}
              icon="tag"
              maxLength={3}
            />

            <View style={styles.modeContainer}>
              <Text style={styles.modeLabel}>MODE</Text>
              <DropDownPicker
                open={modeOpen}
                value={modeValue}
                items={modeItems}
                setOpen={setModeOpen}
                setValue={setModeValue}
                setItems={setModeItems}
                onChangeValue={(value) => {
                  setFieldValue('mode', value);
                  setEnvVars(prev => ({ ...prev, MODE: value }));
                }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholder="Select mode"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <View style={styles.stepActions}>
              <Button
                title="Next Step →"
                onPress={handleSubmit}
                variant="primary"
                size="large"
                style={styles.nextButton}
                disabled={!values.name || !values.sessionId || !values.ownerNumber}
              />
            </View>
          </View>
        )}
      </Formik>
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>Advanced Settings</Text>
          <Text style={styles.stepDescription}>
            Configure advanced bot settings (optional)
          </Text>
        </View>
      </View>

      <ScrollView style={styles.advancedForm}>
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setAdvancedSettings(!advancedSettings)}
        >
          <Text style={styles.advancedToggleText}>
            {advancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </Text>
          <Icon
            name={advancedSettings ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#667eea"
          />
        </TouchableOpacity>

        {advancedSettings && (
          <>
            <Input
              label="SUDO_NUMBER (Optional)"
              placeholder="Additional admin number"
              value={envVars.SUDO_NUMBER}
              onChangeText={(text) =>
                setEnvVars(prev => ({ ...prev, SUDO_NUMBER: text }))
              }
              icon="account-star"
              keyboardType="phone-pad"
            />

            <Input
              label="OWNER_NAME (Optional)"
              placeholder="Bot owner name"
              value={envVars.OWNER_NAME}
              onChangeText={(text) =>
                setEnvVars(prev => ({ ...prev, OWNER_NAME: text }))
              }
              icon="account"
            />

            <Input
              label="STATUS_READ_MSG (Optional)"
              placeholder="Status read message"
              value={envVars.STATUS_READ_MSG}
              onChangeText={(text) =>
                setEnvVars(prev => ({ ...prev, STATUS_READ_MSG: text }))
              }
              icon="message"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto Status Seen</Text>
              <Switch
                value={envVars.AUTO_STATUS_SEEN}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, AUTO_STATUS_SEEN: value }))
                }
                trackColor={{ false: '#767577', true: '#10b981' }}
                thumbColor={envVars.AUTO_STATUS_SEEN ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto Bio</Text>
              <Switch
                value={envVars.AUTO_BIO}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, AUTO_BIO: value }))
                }
                trackColor={{ false: '#767577', true: '#10b981' }}
                thumbColor={envVars.AUTO_BIO ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto Status React</Text>
              <Switch
                value={envVars.AUTO_STATUS_REACT}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, AUTO_STATUS_REACT: value }))
                }
                trackColor={{ false: '#767577', true: '#10b981' }}
                thumbColor={envVars.AUTO_STATUS_REACT ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto Read</Text>
              <Switch
                value={envVars.AUTO_READ}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, AUTO_READ: value }))
                }
                trackColor={{ false: '#767577', true: '#f59e0b' }}
                thumbColor={envVars.AUTO_READ ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto Recording</Text>
              <Switch
                value={envVars.AUTO_RECORDING}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, AUTO_RECORDING: value }))
                }
                trackColor={{ false: '#767577', true: '#f59e0b' }}
                thumbColor={envVars.AUTO_RECORDING ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto React</Text>
              <Switch
                value={envVars.AUTO_REACT}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, AUTO_REACT: value }))
                }
                trackColor={{ false: '#767577', true: '#f59e0b' }}
                thumbColor={envVars.AUTO_REACT ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Anti Link</Text>
              <Switch
                value={envVars.ANTILINK}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, ANTILINK: value }))
                }
                trackColor={{ false: '#767577', true: '#ef4444' }}
                thumbColor={envVars.ANTILINK ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Reject Call</Text>
              <Switch
                value={envVars.REJECT_CALL}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, REJECT_CALL: value }))
                }
                trackColor={{ false: '#767577', true: '#ef4444' }}
                thumbColor={envVars.REJECT_CALL ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Welcome Message</Text>
              <Switch
                value={envVars.WELCOME}
                onValueChange={(value) =>
                  setEnvVars(prev => ({ ...prev, WELCOME: value }))
                }
                trackColor={{ false: '#767577', true: '#3b82f6' }}
                thumbColor={envVars.WELCOME ? '#fff' : '#f4f3f4'}
              />
            </View>
          </>
        )}

        <View style={styles.stepActions}>
          <View style={styles.stepButtons}>
            <Button
              title="← Previous"
              onPress={handlePrevStep}
              variant="outline"
              style={styles.stepButton}
            />
            <Button
              title="Next Step →"
              onPress={handleNextStep}
              variant="primary"
              style={styles.stepButton}
            />
          </View>
        </View>
      </ScrollView>
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNumber}>3</Text>
        </View>
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>Review & Create</Text>
          <Text style={styles.stepDescription}>
            Review your server configuration and create
          </Text>
        </View>
      </View>

      <View style={styles.reviewContainer}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Server Details</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Server Name</Text>
            <Text style={styles.reviewValue}>{envVars.SERVER_NAME || 'Not set'}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Mode</Text>
            <Text style={styles.reviewValue}>{envVars.MODE}</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Bot Configuration</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Owner Number</Text>
            <Text style={styles.reviewValue}>{envVars.OWNER_NUMBER || 'Not set'}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Prefix</Text>
            <Text style={styles.reviewValue}>{envVars.PREFIX}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Session ID</Text>
            <Text style={styles.reviewValue}>
              {envVars.SESSION_ID
                ? `${envVars.SESSION_ID.substring(0, 20)}...`
                : 'Not set'}
            </Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Advanced Settings</Text>
          <View style={styles.reviewGrid}>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>
                Auto Status: {envVars.AUTO_STATUS_SEEN ? 'ON' : 'OFF'}
              </Text>
            </View>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>
                Auto React: {envVars.AUTO_REACT ? 'ON' : 'OFF'}
              </Text>
            </View>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>
                Anti Link: {envVars.ANTILINK ? 'ON' : 'OFF'}
              </Text>
            </View>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>
                Reject Call: {envVars.REJECT_CALL ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </View>

        {coinsCheck && (
          <Card style={styles.coinsCard}>
            <View style={styles.coinsContent}>
              <Icon name="coin" size={24} color="#FFD700" />
              <View style={styles.coinsInfo}>
                <Text style={styles.coinsTitle}>Coins Required</Text>
                <Text style={styles.coinsAmount}>
                  {coinsCheck.requiredCoins} coins
                </Text>
              </View>
              <View style={styles.coinsStatus}>
                <Icon
                  name={coinsCheck.canCreate ? 'check-circle' : 'alert-circle'}
                  size={24}
                  color={coinsCheck.canCreate ? '#10b981' : '#ef4444'}
                />
                <Text
                  style={[
                    styles.coinsStatusText,
                    coinsCheck.canCreate
                      ? styles.coinsSuccess
                      : styles.coinsError,
                  ]}
                >
                  {coinsCheck.canCreate
                    ? `You have ${coinsCheck.userCoins} coins`
                    : `Need ${coinsCheck.difference} more coins`}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.stepActions}>
          <View style={styles.stepButtons}>
            <Button
              title="← Previous"
              onPress={handlePrevStep}
              variant="outline"
              style={styles.stepButton}
            />
            <Button
              title={loading ? 'Creating...' : 'Create Server'}
              onPress={() => handleCreateServer({
                name: envVars.SERVER_NAME,
                environment: envVars,
              })}
              variant="primary"
              style={styles.stepButton}
              loading={loading || serverLoading}
              disabled={!coinsCheck?.canCreate}
              icon="server"
            />
          </View>
          
          {!coinsCheck?.canCreate && (
            <TouchableOpacity
              style={styles.getCoinsButton}
              onPress={() => navigation.navigate('Referrals')}
            >
              <Icon name="coin" size={20} color="#FFD700" />
              <Text style={styles.getCoinsText}>Get More Coins</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map((stepNumber) => (
        <React.Fragment key={stepNumber}>
          <TouchableOpacity
            style={[
              styles.stepCircle,
              step === stepNumber && styles.stepCircleActive,
              step > stepNumber && styles.stepCircleCompleted,
            ]}
            onPress={() => step > stepNumber && setStep(stepNumber)}
          >
            {step > stepNumber ? (
              <Icon name="check" size={16} color="#FFF" />
            ) : (
              <Text
                style={[
                  styles.stepCircleText,
                  step === stepNumber && styles.stepCircleTextActive,
                ]}
              >
                {stepNumber}
              </Text>
            )}
          </TouchableOpacity>
          {stepNumber < 3 && (
            <View
              style={[
                styles.stepLine,
                step > stepNumber && styles.stepLineCompleted,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  if (loading) {
    return <Loader fullScreen message="Creating server..." />;
  }

  return (
    <Layout headerProps={{ title: 'Create Server' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <Card style={styles.indicatorCard}>
          {renderStepIndicator()}
          <View style={styles.stepLabels}>
            <Text style={styles.stepLabel}>Basic Info</Text>
            <Text style={styles.stepLabel}>Settings</Text>
            <Text style={styles.stepLabel}>Review</Text>
          </View>
        </Card>

        {/* Current Step */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Help Card */}
        <Card style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <Icon name="help-circle" size={24} color="#667eea" />
            <Text style={styles.helpTitle}>Need Help?</Text>
          </View>
          <Text style={styles.helpText}>
            • Make sure your SESSION_ID is valid and active{'\n'}
            • Use a valid WhatsApp number for OWNER_NUMBER{'\n'}
            • Get session ID from the generator website{'\n'}
            • Each server costs {coinsCheck?.requiredCoins || 10} coins
          </Text>
          <Button
            title="Get Session ID"
            onPress={handleOpenSessionGenerator}
            variant="outline"
            size="small"
            icon="open-in-new"
            style={styles.helpButton}
          />
        </Card>
      </ScrollView>

      {/* Session Generator Modal */}
      <Modal
        visible={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Get Session ID"
      >
        {sessionData && (
          <View style={styles.sessionModalContent}>
            <Text style={styles.sessionModalText}>
              Visit the session generator website to get your SESSION_ID:
            </Text>
            
            <TouchableOpacity
              style={styles.sessionLink}
              onPress={handleOpenSessionGenerator}
            >
              <Icon name="web" size={20} color="#667eea" />
              <Text style={styles.sessionLinkText}>
                inconnu-tech-web-session-id.onrender.com
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.sessionInstructions}>
              1. Visit the website above{'\n'}
              2. Click "Generate Session"{'\n'}
              3. Scan QR code with WhatsApp{'\n'}
              4. Copy the SESSION_ID{'\n'}
              5. Paste it in the form
            </Text>
            
            <Button
              title="Open Website"
              onPress={handleOpenSessionGenerator}
              variant="primary"
              style={styles.sessionModalButton}
            />
            
            <Button
              title="Close"
              onPress={() => setShowSessionModal(false)}
              variant="outline"
              style={styles.sessionModalButton}
            />
          </View>
        )}
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  indicatorCard: {
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#667eea',
  },
  stepCircleCompleted: {
    backgroundColor: '#10b981',
  },
  stepCircleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  stepCircleTextActive: {
    color: '#FFF',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e2e8f0',
  },
  stepLineCompleted: {
    backgroundColor: '#10b981',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  stepLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  stepCard: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  sessionContainer: {
    marginBottom: 16,
  },
  sessionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  modeContainer: {
    marginBottom: 16,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 14,
  },
  stepActions: {
    marginTop: 24,
  },
  nextButton: {
    width: '100%',
  },
  advancedForm: {
    maxHeight: 500,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 16,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  stepButton: {
    flex: 1,
  },
  reviewContainer: {
    width: '100%',
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#666',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  reviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewBadgeText: {
    fontSize: 12,
    color: '#333',
  },
  coinsCard: {
    marginBottom: 24,
  },
  coinsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coinsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  coinsAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  coinsStatus: {
    alignItems: 'flex-end',
  },
  coinsStatusText: {
    fontSize: 12,
    marginTop: 4,
  },
  coinsSuccess: {
    color: '#10b981',
  },
  coinsError: {
    color: '#ef4444',
  },
  getCoinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  getCoinsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f59e0b',
    marginLeft: 8,
  },
  helpCard: {
    marginBottom: 32,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    width: '100%',
  },
  sessionModalContent: {
    padding: 20,
  },
  sessionModalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  sessionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sessionLinkText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  sessionInstructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 10,
  },
  sessionModalButton: {
    marginBottom: 12,
  },
});

export default CreateServerScreen;
