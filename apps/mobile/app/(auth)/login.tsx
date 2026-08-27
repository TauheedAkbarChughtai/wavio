import { SelectPortalContext } from "@gluestack-ui/core/lib/esm/select/creator/SelectContext";
import { useForm } from "@tanstack/react-form";
import axios from "axios";
import { formatISO } from "date-fns/formatISO";
import { useLocalSearchParams } from "expo-router";
import EyeIcon from "lucide-react-native/dist/esm/icons/eye.mjs";
import EyeOffIcon from "lucide-react-native/dist/esm/icons/eye-off.mjs";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import Logo from "@/assets/images/logo.svg";
const user1Img = require("@/assets/images/user1.png");
const user2Img = require("@/assets/images/user2.png");
import CertificateTrustDialog from "@/components/auth/CertificateTrustDialog";
import LocalLibraryInfoDialog from "@/components/auth/LocalLibraryInfoDialog";
import { View } from "react-native";
import FadeOutScaleDown from "@/components/FadeOutScaleDown";
import AdvancedSettingsSection from "@/components/forms/AdvancedSettingsSection";
import ClientCertificateField from "@/components/forms/ClientCertificateField";
import FallbackUrlField from "@/components/forms/FallbackUrlField";
import FieldError, {
  handleFieldBlur,
  showFieldError,
} from "@/components/forms/FieldError";
import LocalPathsField from "@/components/forms/LocalPathsField";
import UrlInputField from "@/components/forms/UrlInputField";
import LoginBackground from "@/components/LoginBackground";
import ServerTypeIcon from "@/components/ServerTypeIcon";
import {
  Avatar,
  AvatarFallbackText,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
  hostnameFromUrl,
  isSslTrustAvailable,
  trustCertificate,
} from "@/modules/ssl-trust";
import {
  authenticateWithFallback,
  SslUntrustedError,
} from "@/services/auth/authenticate";
import { reportError, scrubUrl } from "@/services/errorReporting";
import { syncSslClientCertificates, syncSslProxy } from "@/services/sslTrust";
import useAuth, { loginSchema } from "@/stores/auth";
import useServers, {
  cleanOptionalUrl,
  type Server,
  type ServerType,
  type ServerUser,
} from "@/stores/servers";
import { computeSubsonicToken } from "@/services/openSubsonic/auth";
import { generateSalt } from "@/services/openSubsonic/auth";

function ServerSelectRow({
  server,
  users,
}: {
  server: Server;
  users: ServerUser[];
}) {
  const { onValueChange, handleClose } = useContext(SelectPortalContext);
  return (
    <FadeOutScaleDown
      className="mb-4 w-full"
      onPress={() => {
        onValueChange?.(server.id);
        handleClose?.();
      }}
    >
      <VStack className="bg-primary-600 px-4 py-2 w-full rounded-md border border-primary-600">
        <HStack className="items-start justify-between">
          <HStack className="mr-3">
            <ServerTypeIcon type={server.type} size={28} />
          </HStack>
          <VStack className="flex-1">
            <Heading size="md" className="text-white" numberOfLines={1}>
              {server.name}
            </Heading>
            <Text className="text-primary-100 text-sm mb-2" numberOfLines={1}>
              {server.url}
            </Text>
            {users.length > 0 && (
              <AvatarGroup>
                {users.slice(0, 4).map((u) => (
                  <Avatar
                    key={`${u.serverId}:${u.username}`}
                    className="bg-primary-400 w-8 h-8"
                  >
                    <AvatarFallbackText>{u.username}</AvatarFallbackText>
                  </Avatar>
                ))}
              </AvatarGroup>
            )}
          </VStack>
        </HStack>
      </VStack>
    </FadeOutScaleDown>
  );
}

export default function LoginScreen() {
  const [white, primary800] = Uniwind.getCSSVariable([
    "--color-white",
    "--color-primary-800",
  ]) as string[];
  const { t } = useTranslation();
  const toast = useToast();
  const params = useLocalSearchParams<{
    serverId?: string;
    username?: string;
  }>();
  const servers = useServers((store) => store.servers);
  const allUsers = useServers((store) => store.users);
  const addServer = useServers((store) => store.addServer);
  const setCurrentServer = useServers((store) => store.setCurrentServer);
  const addOrUpdateUser = useServers((store) => store.addOrUpdateUser);
  const login = useAuth((store) => store.login);
  const insets = useSafeAreaInsets();
  // biome-ignore lint/suspicious/noExplicitAny: gluestack ref typing
  const usernameRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: gluestack ref typing
  const passwordRef = useRef<any>(null);

  const preselectedServer = useMemo(
    () =>
      params.serverId
        ? servers.find((s) => s.id === params.serverId)
        : servers.find((s) => s.current),
    [params.serverId, servers],
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showLocalInfo, setShowLocalInfo] = useState(false);
  // URL whose certificate the user is being asked to trust (TOFU). Set when a
  // login attempt fails with an untrusted TLS certificate; cleared on
  // cancel/trust.
  const [sslPromptUrl, setSslPromptUrl] = useState<string | null>(null);
  // Pre-check when this server+user already has a saved password (e.g. an avatar
  // re-login). Initial value only; the user can toggle it freely afterwards.
  const [saveCredentials, setSaveCredentials] = useState(() =>
    preselectedServer && params.username
      ? allUsers.some(
          (u) =>
            u.serverId === preselectedServer.id &&
            u.username === params.username &&
            !!u.password,
        )
      : false,
  );

  const [loggingInUser, setLoggingInUser] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: params.username ?? "",
      password: "",
      url: preselectedServer?.url ?? "https://",
      type: (preselectedServer?.type ?? "navidrome") as ServerType,
      paths: (preselectedServer?.paths ?? []) as string[],
      mtlsAlias: preselectedServer?.mtlsAlias ?? "",
      fallbackUrl: preselectedServer?.fallbackUrl ?? "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const trimmedUrl = (value.url ?? "").trim();
        const trimmedUsername = (value.username ?? "").trim();
        const trimmedPassword = (value.password ?? "").trim();
        const serverType: ServerType = value.type;

        if (serverType === "local") {
          const paths = (value.paths ?? [])
            .map((p) => p.trim())
            .filter(Boolean);
          if (paths.length === 0) {
            toast.show({
              placement: "top",
              duration: 3000,
              render: () => (
                <Toast action="error">
                  <ToastTitle>{t("app.shared.toastErrorTitle")}</ToastTitle>
                  <ToastDescription>
                    {t("auth.login.localNoPaths")}
                  </ToastDescription>
                </Toast>
              ),
            });
            return;
          }
          // Single local server (no remote URL, no multiple accounts): a fixed
          // sentinel URL/username so the per-(server,user) scope is stable.
          const existing = servers.find((s) => s.type === "local");
          const server = addServer({
            name: existing?.name ?? t("auth.login.localLibraryName"),
            url: "local",
            type: "local",
            paths,
          });
          setCurrentServer(server.id);
          login({
            serverId: server.id,
            url: "local",
            username: "local",
            password: "",
            serverType: "local",
          });
        } else {
          const mtlsAlias = value.mtlsAlias?.trim() || undefined;
          const fallbackUrl = cleanOptionalUrl(value.fallbackUrl);
          // Register the client cert with the native KeyManager before the
          // handshake so mTLS servers get it presented on this first request —
          // for both routes, since either may be the one we end up talking to.
          await syncSslClientCertificates({
            url: trimmedUrl,
            fallbackUrl,
            alias: mtlsAlias,
          });
          const { options, activeUrl } = await authenticateWithFallback(
            serverType,
            trimmedUrl,
            fallbackUrl,
            trimmedUsername,
            trimmedPassword,
          );
          const existing = servers.find((s) => s.url === trimmedUrl);
          const fallbackName = `${t("app.servers.defaultServer")} (${formatISO(new Date())})`;
          const server = addServer({
            name: existing?.name ?? fallbackName,
            url: trimmedUrl,
            type: serverType,
            mtlsAlias,
            fallbackUrl,
          });
          // Persist the password only when the user opted in; passing undefined
          // clears any previously saved password for this server+user.
          addOrUpdateUser({
            serverId: server.id,
            username: trimmedUsername,
            password: saveCredentials ? trimmedPassword : undefined,
          });
          setCurrentServer(server.id);
          // `activeUrl` may be the fallback: the scope is keyed on serverId, so
          // which route we signed in through doesn't affect where state lives.
          login({
            serverId: server.id,
            url: activeUrl,
            username: trimmedUsername,
            password: trimmedPassword,
            ...options,
          });
          // Register the fallback origin as an iOS proxy upstream now that the
          // server is saved; without it, streaming over a self-signed fallback
          // fails silently under AVPlayer.
          await syncSslProxy();
        }
        toast.show({
          placement: "top",
          duration: 3000,
          render: () => (
            <Toast action="success">
              <ToastTitle>{t("app.shared.toastSuccessTitle")}</ToastTitle>
              <ToastDescription>
                {t("auth.login.loginSuccessMessage")}
              </ToastDescription>
            </Toast>
          ),
        });
      } catch (error) {
        // Untrusted TLS certificate: offer Trust-On-First-Use instead of a
        // generic error, so the user can inspect and accept a self-signed cert
        // and retry. Not reported to Sentry — it's an expected, recoverable
        // state for self-hosted servers.
        if (error instanceof SslUntrustedError) {
          setSslPromptUrl(error.url);
          return;
        }
        // Login failures never reach the axios interceptors (auth uses its own
        // bare client), so report them here — otherwise this whole class of bug
        // is invisible in Sentry. Tagged `auth` (not `api`) and without a
        // `backend` so the offline / server-unreachable gates in reportError
        // don't suppress it: during a fresh login the reachability probe hasn't
        // confirmed the not-yet-active server.
        reportError(error, {
          area: "auth",
          endpoint: `${value.type} login`,
          status: axios.isAxiosError(error)
            ? error.response?.status
            : undefined,
          extra: {
            serverType: value.type,
            url: scrubUrl((value.url ?? "").trim()),
            hasResponse: axios.isAxiosError(error)
              ? !!error.response
              : undefined,
          },
        });
        toast.show({
          placement: "top",
          duration: 3000,
          render: () => (
            <Toast action="error">
              <ToastTitle>{t("app.shared.toastErrorTitle")}</ToastTitle>
              <ToastDescription>
                {axios.isAxiosError(error)
                  ? t("auth.login.loginErrorMessage")
                  : (error as Error).message}
              </ToastDescription>
            </Toast>
          ),
        });
      }
    },
  });

  useEffect(() => {
    if (params.username) {
      passwordRef.current?.focus();
    } else if (params.serverId) {
      usernameRef.current?.focus();
    }
  }, [params.serverId, params.username]);

  const handleServerChange = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId);
    if (!server) return;
    setCurrentServer(server.id);
    form.setFieldValue("url", server.url);
    form.setFieldValue("username", "");
    form.setFieldValue("password", "");
    form.setFieldValue("type", server.type);
    form.setFieldValue("paths", server.paths ?? []);
    form.setFieldValue("mtlsAlias", server.mtlsAlias ?? "");
    // Without this the previously selected server's fallback would leak into
    // the newly selected one.
    form.setFieldValue("fallbackUrl", server.fallbackUrl ?? "");
    if (server.type !== "local") {
      setTimeout(() => usernameRef.current?.focus(), 250);
    }
  };

  const handleDemoModePress = () => {
    form.setFieldValue("url", "https://demo.navidrome.org");
    form.setFieldValue("username", "demo");
    form.setFieldValue("password", "demo");
    form.setFieldValue("type", "navidrome");
  };

  const handleNavidromeSetupHelpPress = () => {
    Linking.openURL("https://www.navidrome.org/docs/installation/");
  };

  const handleJellyfinSetupHelpPress = () => {
    Linking.openURL("https://jellyfin.org/docs/general/quick-start");
  };

  const serverTypeOptions: { value: ServerType; label: string }[] = [
    { value: "navidrome", label: t("auth.login.serverTypeNavidrome") },
    { value: "opensubsonic", label: t("auth.login.serverTypeOpenSubsonic") },
    { value: "jellyfin", label: t("auth.login.serverTypeJellyfin") },
    { value: "local", label: t("auth.login.serverTypeLocal") },
  ];
  const serverTypeRows: [
    (typeof serverTypeOptions)[number],
    (typeof serverTypeOptions)[number]?,
  ][] = [];
  for (let i = 0; i < serverTypeOptions.length; i += 2) {
    serverTypeRows.push([serverTypeOptions[i], serverTypeOptions[i + 1]]);
  }

  const triggerLabel =
    preselectedServer?.name ?? t("auth.login.serverPlaceholder");

  const handleUserLogin = async (userType: 'Tauheed' | 'saramara') => {
    if (loggingInUser) return;
    setLoggingInUser(userType);

    try {
      let targetUrl = "https://music.tauheedakbar.com";
      let username = "";
      let password = "";

      if (userType === 'Tauheed') {
        username = "Tauheed";
        password = "ActuallyStrongPassword1!";

        try {
          const pingPromise = axios.get("http://192.168.100.93:4533/rest/ping.view", { params: { u: username, p: password, v: '1.16.1', c: 'WavioMobileApp' } });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));

          await Promise.race([pingPromise, timeoutPromise]);
          targetUrl = "http://192.168.100.93:4533";
        } catch (e) {
          // Keep remote URL on failure
        }
      } else {
        username = "saramara";
        password = "multansultan789";
      }

      const serverType: ServerType = "navidrome";

      const { options, activeUrl } = await authenticateWithFallback(
        serverType,
        targetUrl,
        undefined,
        username,
        password,
      );

      const server = addServer({
        name: "Wavio Custom 2-Player Ecosystem",
        url: targetUrl,
        type: serverType,
        fallbackUrl: undefined,
      });

      addOrUpdateUser({
        serverId: server.id,
        username: username,
        password: password,
      });

      setCurrentServer(server.id);

      login({
        serverId: server.id,
        url: activeUrl,
        username: username,
        password: password,
        ...options,
      });

    } catch (e) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: () => (
          <Toast action="error">
            <ToastTitle>{t("app.shared.toastErrorTitle")}</ToastTitle>
            <ToastDescription>Login failed</ToastDescription>
          </Toast>
        ),
      });
      setLoggingInUser(null);
    }
  };

  return (
    <Box className="flex-1 bg-black">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <Box className="px-6 w-full max-w-[480px] self-center items-center">
          <Center className="mb-12">
            <Logo width={64} height={64} />
          </Center>

          <HStack className="w-full justify-around items-center gap-x-8">
            <VStack className="items-center">
              <FadeOutScaleDown onPress={() => handleUserLogin('Tauheed')}>
                <Box className={`relative ${loggingInUser === 'saramara' ? 'opacity-50' : 'opacity-100'}`}>
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage source={user1Img} />
                    <AvatarFallbackText>Tauheed</AvatarFallbackText>
                  </Avatar>
                  {loggingInUser === 'Tauheed' && (
                    <Box className="absolute inset-0 items-center justify-center bg-black/50 rounded-full w-24 h-24">
                      <Spinner size="large" color={white} />
                    </Box>
                  )}
                </Box>
              </FadeOutScaleDown>
              <Text className="text-white text-lg font-semibold">Tauheed</Text>
            </VStack>

            <VStack className="items-center">
              <FadeOutScaleDown onPress={() => handleUserLogin('saramara')}>
                <Box className={`relative ${loggingInUser === 'Tauheed' ? 'opacity-50' : 'opacity-100'}`}>
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage source={user2Img} />
                    <AvatarFallbackText>saramara</AvatarFallbackText>
                  </Avatar>
                  {loggingInUser === 'saramara' && (
                    <Box className="absolute inset-0 items-center justify-center bg-black/50 rounded-full w-24 h-24">
                      <Spinner size="large" color={white} />
                    </Box>
                  )}
                </Box>
              </FadeOutScaleDown>
              <Text className="text-white text-lg font-semibold">saramara</Text>
            </VStack>
          </HStack>
        </Box>
      </View>
    </Box>
  );
}
