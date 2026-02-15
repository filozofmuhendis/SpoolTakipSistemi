import { personnelRepository, PersonnelUpdate } from '@/repositories/personnelRepository'
import { supabaseAdmin } from '@/lib/supabase'

export class PersonnelService {
    async getAllPersonnel() {
        return await personnelRepository.findAll()
    }

    async getActivePersonnel() {
        return await personnelRepository.findActive()
    }

    async getPersonnelByDepartment(department: string) {
        return await personnelRepository.findByDepartment(department)
    }

    async updatePersonnel(id: string, updates: PersonnelUpdate) {
        return await personnelRepository.update(id, updates)
    }

    async getPersonnelById(id: string) {
        const person = await personnelRepository.findById(id)
        if (!person) throw new Error('Personnel not found')
        return person
    }

    async getManagers() {
        return await personnelRepository.findManagers()
    }

    // Admin Operations
    async createPersonnel(data: { email: string; password: string; full_name: string; phone?: string; department?: string; position?: string }) {
        if (!supabaseAdmin) throw new Error('Server configuration error: supabaseAdmin not available')

        const { email, password, full_name, phone, department, position } = data

        // 1. Create user in auth system
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name }
        })

        if (authError || !authData.user) {
            throw new Error(authError?.message || 'Failed to create auth user')
        }

        // 2. Update profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name,
                phone,
                department,
                position
            })
            .eq('id', authData.user.id)
            .select()
            .single()

        if (profileError) {
            // Cleanup
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            throw new Error(profileError.message)
        }

        return profile
    }

    async deletePersonnel(id: string) {
        if (!supabaseAdmin) throw new Error('Server configuration error: supabaseAdmin not available')

        const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (error) throw error
        return true
    }
}

export const personnelService = new PersonnelService()
