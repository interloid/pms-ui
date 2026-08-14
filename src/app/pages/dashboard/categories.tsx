import { useNavigate } from "react-router-dom";
import EmptyPage from "@/components/shad/empty-page";
import { Button } from "@/components/ui/button";
import CategoryIcon from '@mui/icons-material/Category';

export default function Categories() {
  const navigate = useNavigate();

  return (
    <EmptyPage
      icon={CategoryIcon}
      title="Nothing here yet"
      description="Categories isn’t part of this build. The nav item routes to this placeholder so the shell feels complete."
    >
      <Button
        variant="secondary"
        onClick={() => navigate("/products")}
      >
        Go to Products
      </Button>
    </EmptyPage>
  );
}