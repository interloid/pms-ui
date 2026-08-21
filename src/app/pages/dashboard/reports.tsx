import { useNavigate } from "react-router-dom";
import EmptyPage from "@/components/shad/empty-page";
import { Button } from "@/components/ui/button";
import ReportOffIcon from '@mui/icons-material/ReportOff';

export default function Reports() {
  const navigate = useNavigate();

  return (
    <EmptyPage
     icon ={ReportOffIcon}
      title="Nothing here yet"
      description="Reports isn’t part of this build. The nav item routes to this placeholder so the shell feels complete."
    >
      <Button variant="secondary" onClick={() => navigate("/products")}>
        Go to Products
      </Button>
    </EmptyPage>
  );
}