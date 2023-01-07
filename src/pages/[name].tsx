import { useRouter } from "next/router";
import { Timeline } from "../components";

const UserPage = () => {
  const router = useRouter();
  const name = router.query.name as string;

  return (
    <div>
      <Timeline where={{ author: { name } }} />
    </div>
  );
};

export default UserPage;
