// Resolves the signed-in user's school workspace and coaching role, assigning
// the locked school_id / app_role fields the first time a member signs in.
const rows = (result) => (Array.isArray(result) ? result : result?.items ?? []);
const lower = (value) => String(value || "").toLowerCase();

export async function resolveWorkspace(context) {
  const base44 = context.getBase44();
  const admin = base44.asServiceRole;
  const user = context.user;
  if (!user) throw new Error("Sign in to continue.");

  const storedSchoolId = user.school_id || user.data?.school_id || null;
  const storedRole = user.app_role || user.data?.app_role || null;

  let school = null;
  let role = "Student";

  if (storedSchoolId) {
    school = rows(await admin.entities.School.filter({ school_id: storedSchoolId }))[0] ?? null;
    if (school) role = storedRole || "Student";
  }

  if (!school) {
    school = rows(await admin.entities.School.filter({ head_coach_email: lower(user.email) }))[0] ?? null;
    if (school) role = "Head Coach";
  }

  if (!school && user.role === "admin") {
    school = rows(await admin.entities.School.list("-created_date", 1))[0] ?? null;
    if (school) role = "Head Coach";
  }

  if (!school) {
    const email = lower(user.email);
    const [p1, p2, p3, applications, mentors] = await Promise.all([
      admin.entities.Partnership.filter({ student_1_email: email }),
      admin.entities.Partnership.filter({ student_2_email: email }),
      admin.entities.Partnership.filter({ student_3_email: email }),
      admin.entities.StudentApplication.filter({ student_email: email }),
      admin.entities.Mentor.filter({ mentor_email: email }),
    ]);
    const partnership = [...rows(p1), ...rows(p2), ...rows(p3)][0] ?? null;
    const mentor = rows(mentors)[0] ?? null;
    const application = rows(applications)[0] ?? null;
    const schoolId = partnership?.school_id || mentor?.school_id || application?.school_id || null;
    if (schoolId) {
      school = rows(await admin.entities.School.filter({ school_id: schoolId }))[0] ?? null;
      role = mentor ? "Event Mentor" : "Student";
    }
  }

  if (!school) {
    throw new Error(
      "No team found for this email yet. Ask your head coach to add you to a partnership or the mentor list, then reload.",
    );
  }

  if (!storedRole && role !== "Head Coach" && school.head_coach_email && lower(school.head_coach_email) === lower(user.email)) {
    role = "Head Coach";
  }

  if (storedSchoolId !== school.school_id || storedRole !== role) {
    await admin.entities.User.update(user.id, { school_id: school.school_id, app_role: role });
  }

  return { base44, admin, user, school, role };
}

export async function requireHeadCoach(context) {
  const workspace = await resolveWorkspace(context);
  if (workspace.role !== "Head Coach") {
    throw Object.assign(new Error("Head coaches only"), { status: 403 });
  }
  return workspace;
}