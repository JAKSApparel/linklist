import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PageButtonsForm from "@/components/forms/PageButtonsForm";
import PageLinksForm from "@/components/forms/PageLinksForm";
import PageSettingsForm from "@/components/forms/PageSettingsForm";
import UsernameForm from "@/components/forms/UsernameForm";
import { Page } from "@/models/Page";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import cloneDeep from 'clone-deep';

export default async function AccountPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const desiredUsername = searchParams?.desiredUsername;

  // Redirect to homepage if there is no session
  if (!session) {
    return redirect('/');
  }

  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      return (
        <div>
          <p>Sorry, we&apos;re having trouble connecting to the database. Please try again later.</p>
        </div>
      );
    }
  }

  try {
    // Find the page associated with the current user
    const page = await Page.findOne({ owner: session.user.email });

    if (page) {
      // Clone the page object and prepare it for rendering
      const leanPage = cloneDeep(page.toJSON());
      leanPage._id = leanPage._id.toString();

      return (
        <>
          <PageSettingsForm page={leanPage} user={session.user} />
          <PageButtonsForm page={leanPage} user={session.user} />
          <PageLinksForm page={leanPage} user={session.user} />
        </>
      );
    } else {
      return (
        <div>
          <UsernameForm desiredUsername={desiredUsername} />
        </div>
      );
    }
  } catch (error) {
    console.error("Error fetching page data:", error);
    return (
      <div>
        <p>Sorry, there was an error loading your account. Please try again later.</p>
      </div>
    );
  }
}
