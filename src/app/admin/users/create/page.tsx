import { Card } from "@/components/ui/card";
import { UserForm } from "../UserEditForm";

export default function CreatePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center items-center">
      <Card className="p-4 max-w-4xl">
        <UserForm />
      </Card>
    </div>
  );
}
