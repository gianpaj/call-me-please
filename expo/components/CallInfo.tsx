import { useMaybeRoomContext } from "@livekit/components-react";
import * as ToastPrimitive from "@rn-primitives/toast";
import type { RpcInvocationData } from "livekit-client";
import { useEffect } from "react";
import { View } from "react-native";
import { useToast } from "~/hooks/use-toast";

export const CallInfo = () => {
  const room = useMaybeRoomContext();
  // const toast = useToast();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    room?.registerRpcMethod("pg.toast", async (data: RpcInvocationData) => {
      const { title, description, variant } = JSON.parse(data.payload);
      console.log(title, description, variant);
      // toast({
      //   title,
      //   description,
      //   variant,
      // });
      return JSON.stringify({ shown: true });
    });
    return () => {
      room?.unregisterRpcMethod("pg.toast");
    };
  }, [room]);
  // }, [room, toast]);
  return <View></View>;
};
